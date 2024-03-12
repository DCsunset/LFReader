# LFReader
# Copyright (C) 2022-2024  DCsunset

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.

# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

import sqlite3
import logging
import sys
import json
from typing import Iterable, Any
from itertools import product, repeat
import feedparser
from datetime import datetime, timezone
from time import struct_time
from functools import partial
import asyncio
import aiohttp

from .archive import Archiver

def parsed_time_to_iso(parsed_time: struct_time | None):
  # the parsed time is guaranteed to be utc
  return parsed_time and datetime(*parsed_time[:6], tzinfo=timezone.utc).isoformat()

# pack data into JSON string
def pack_data(value):
  # use None for empty value (e.g. [], "", None)
  if not value:
    return None
  return json.dumps(value)

# unpack JSON data in row
def unpack_data(key, value):
  # json fields with default value
  json_fields = {
    "user_data": {},
    "enclosures": [],
    "contents": [],
    "summary": {}
  }
  if key in json_fields:
    return json.loads(value) if value else json_fields[key]
  else:
    return value

# convert sqlite3 row into dict
def dict_row_factory(cursor: sqlite3.Cursor, row: sqlite3.Row):
  fields = [column[0] for column in cursor.description]
  return {key: unpack_data(key, value) for key, value in zip(fields, row)}

# SQL query that updates field by coalescing with old fields
def sql_update_field(table: str, field: str):
  return f"{field} = COALESCE(excluded.{field}, {table}.{field})"

class Storage:
  def __init__(self, db_file: str, archive_dir: str, archive_url: str, user_agent: str | None):
    self.db = sqlite3.connect(db_file)
    self.db.row_factory = dict_row_factory
    self.init_db()
    self.archiver = Archiver(archive_dir, archive_url)
    self.headers = {}
    if user_agent is not None:
      self.headers["User-Agent"] = user_agent
    logging.info(f"Database path: {db_file}")

  def init_db(self):
    try:
      self.db.execute('''
        CREATE TABLE IF NOT EXISTS feeds (
          -- feed data
          url TEXT PRIMARY KEY,
          link TEXT,
          author TEXT,
          title TEXT,
          subtitle TEXT,
          logo TEXT,  -- logo filename in resources dir
          published_at TEXT,  -- ISO DateTime
          updated_at TEXT,  -- ISO DateTime

          -- extra metadata
          fetched_at TEXT,  -- when this feed was last fetched
          added_at TEXT,  -- when this feed was first added to db
          user_data TEXT  -- custom user data in JSON format
        )
      ''')
      self.db.execute('''
        CREATE TABLE IF NOT EXISTS entries (
          -- entry data
          feed_url TEXT NOT NULL,
          id TEXT NOT NULL,
          link TEXT,
          author TEXT,
          title TEXT,
          summary TEXT,  -- JSON string
          contents TEXT,  -- JSON string
          enclosures TEXT,  -- JSON string
          published_at TEXT,  -- ISO DateTime
          updated_at TEXT,  -- ISO DateTime

          -- extra metadata
          fetched_at TEXT,  -- when this entry's resources were last fetched
          added_at TEXT,  -- when this entry was first added to db
          user_data TEXT,  -- custom user data in JSON format

          PRIMARY KEY (feed_url, id),
          FOREIGN KEY (feed_url) REFERENCES feeds(url)
            ON UPDATE CASCADE
            ON DELETE CASCADE
        )
      ''')
      self.db.execute('''
        -- Indexes for fast lookup by feed_url
        CREATE INDEX IF NOT EXISTS entries_by_feed_url on entries(feed_url)
      ''')
      self.db.execute('''
        -- Indexes for accessing entries by published_at efficiently
        CREATE INDEX IF NOT EXISTS entries_by_published_at on entries(published_at)
      ''')
    except Exception as e:
      logging.critical(f"Error init db: {e}")
      sys.exit(1)

  async def archive_content(self, session, feed_url: str, content, base_url: str | None):
    if not content:
      return None
    if content.get("type") != "text/plain":
      content["value"] = await self.archiver.archive_html(session, feed_url, content.get("value"), base_url)
    return content

  async def archive_contents(self, session, feed_url: str, contents, base_url: str | None):
    if not contents:
      return None

    await asyncio.gather(
      *map(
        lambda c: self.archive_content(session, feed_url, c, base_url),
        contents
      )
    )
    return contents

  """
  Fetch feeds.
  If feed_urls is None, fetch all feeds
  """
  async def fetch_feeds(self, feed_urls: Iterable[str] | None, archive: bool):
    async with aiohttp.ClientSession(headers=self.headers) as session:
      urls = feed_urls or map(lambda v: v["url"], self.get_feed_urls())
      feeds = map(lambda url: (url, feedparser.parse(url, resolve_relative_uris=False)), urls)
      now = datetime.now().astimezone().isoformat()
      update_feed_field = partial(sql_update_field, "feeds")
      update_entry_field = partial(sql_update_field, "entries")

      for url, f in feeds:
        self.db.execute(
          f'''
          INSERT INTO feeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(url) DO UPDATE SET
              {update_feed_field("link")},
              {update_feed_field("author")},
              {update_feed_field("title")},
              {update_feed_field("subtitle")},
              {update_feed_field("logo")},
              {update_feed_field("published_at")},
              {update_feed_field("updated_at")},
              -- extra metadata
              {update_feed_field("fetched_at")}
          ''',
          (
            url,
            f.feed.get("link"),
            f.feed.get("author"),
            f.feed.get("title"),
            f.feed.get("subtitle"),
            f.feed.get("logo"),
            parsed_time_to_iso(f.feed.get("published_parsed")),
            parsed_time_to_iso(f.feed.get("updated_parsed")),
            now,
            now,
            None
          )
        )

        # unpacked already when converting to row dict
        feed_user_data = self.db.execute(
          "SELECT user_data FROM feeds WHERE url = ?",
          (url,)
        ).fetchone().get("user_data")
        # None should be substituted by {}
        assert (feed_user_data != None)

        # TODO: parallelize fetching
        for e in f.entries:
          # base url for feed resources
          base_url = feed_user_data.get("base_url", e.get("link"))
          summary = e.get("summary_detail")
          contents = e.get("content")
          if archive:
            summary = await self.archive_content(session, url, summary, base_url)
            contents = await self.archive_contents(session, url, contents, base_url)

          self.db.execute(
            f'''
            INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(feed_url, id) DO UPDATE SET
                {update_entry_field("link")},
                {update_entry_field("author")},
                {update_entry_field("title")},
                {update_entry_field("summary")},
                {update_entry_field("contents")},
                {update_entry_field("enclosures")},
                {update_entry_field("published_at")},
                {update_entry_field("updated_at")},
                -- extra metadata
                {update_entry_field("fetched_at")}
            ''',
            (
              url,
              e.get("id", e.link),
              e.get("link"),
              e.get("author"),
              e.get("title"),
              pack_data(summary),
              pack_data(contents),
              pack_data(e.get("enclosures")),
              parsed_time_to_iso(e.get("published_parsed")),
              parsed_time_to_iso(e.get("updated_parsed")),
              now,
              now,
              None
            )
          )
      # insert will create a tx. Must commit to save data
      self.db.commit()

  def get_feed_urls(self) -> list[str]:
    # result is a dict after dict_row_factory
    return self.db.execute("SELECT url FROM feeds").fetchall()

  def get_feeds(self) -> list[dict[str, Any]]:
    # result is a dict after dict_row_factory
    return self.db.execute("SELECT * FROM feeds").fetchall()

  def get_entries(
      self,
      feed_urls: list[str] | None = None,
      offset: int = -1,
      limit: int = -1
  ) -> list[dict]:
    query = "SELECT * FROM entries"
    args = []
    if feed_urls is not None:
      # use placeholder to prevent SQL injection
      placeholders = ", ".join(repeat("?", len(feed_urls)))
      query += f" WHERE feed_url IN ({placeholders})"
      args.extend(feed_urls)

    # -1 means no limit or offset
    query += " ORDER BY published_at DESC LIMIT ? OFFSET ?"
    args.extend((limit, offset))

    return self.db.execute(query, args).fetchall()

  def update_feed(self, feed_url: str, user_data: dict):
    self.db.execute(
      "UPDATE feeds SET user_data = ? WHERE url = ?",
      (pack_data(user_data), feed_url)
    )
    self.db.commit()

  def delete_feeds(self, feed_urls: list[str]):
    placeholders = ", ".join(repeat("?", len(feed_urls)))
    self.db.execute(f"DELETE FROM feeds WHERE url IN ({placeholders})", feed_urls)
    # delete associated entries
    self.db.execute(f"DELETE FROM entries WHERE feed_url IN ({placeholders})", feed_urls)
    # delete will create a tx. Must commit to save data
    self.db.commit()

    # delete archived resources
    self.archiver.delete_archives(feed_urls)

