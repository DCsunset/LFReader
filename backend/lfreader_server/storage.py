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
from pathlib import Path
from typing import Iterable, Any
from itertools import product, repeat
import feedparser
from datetime import datetime, timezone
from time import struct_time
from functools import partial
import asyncio
import aiohttp
from hashlib import blake2s
from fastapi import HTTPException

from .archive import Archiver
from .config import Config

async def parse_feed(session: aiohttp.ClientSession, f: dict):
  async with session.get(f["url"]) as resp:
    return (
      f["url"],
      f["user_data"],
      # use aiohttp to download for better error handling, headers and timeout
      feedparser.parse(
        await resp.read(),
        resolve_relative_uris=False
      )
    )

def parsed_time_to_iso(parsed_time: struct_time | None):
  # the parsed time is guaranteed to be utc
  return parsed_time and datetime(*parsed_time[:6], tzinfo=timezone.utc).isoformat()

def hash_dicts(dicts: list[dict]):
  """
  compute hash value of a list of dict
  """
  h = blake2s()
  for d in dicts:
    s = json.dumps(d, sort_keys=True).encode()
    h.update(s)
  return h.hexdigest()


# pack data into JSON string
def pack_data(value):
  # use None for empty value (e.g. {}, [], "", None)
  if not value:
    return None
  return json.dumps(value)

# unpack JSON data in row
def unpack_data(key, value):
  # json fields with default value
  json_fields = {
    "server_data": {},
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
  def __init__(self, config: Config):
    self.cfg = config
    # create parent directories to prevent error
    Path(config.db_file).parent.mkdir(parents=True, exist_ok=True)
    self.db = sqlite3.connect(config.db_file)
    self.db.row_factory = dict_row_factory
    self.init_db()
    self.archiver = Archiver(config.archiver)
    self.headers = {}
    if config.user_agent is not None:
      self.headers["User-Agent"] = config.user_agent
    self.timeout = aiohttp.ClientTimeout(total=config.timeout)

  def init_db(self):
    try:
      self.db.execute('''
        CREATE TABLE IF NOT EXISTS feeds (
          --- feed data ---
          url TEXT PRIMARY KEY,
          link TEXT,
          author TEXT,
          title TEXT,
          subtitle TEXT,
          logo TEXT,  -- logo filename in resources dir
          published_at TEXT,  -- ISO DateTime
          updated_at TEXT,  -- ISO DateTime

          --- extra metadata ---
          -- server data in JSON format
          -- - fetched_at: when this feed was last fetched
          -- - added_at: when this feed was first added to db
          server_data TEXT,

          -- user data used by client in JSON format
          user_data TEXT
        )
      ''')
      self.db.execute('''
        CREATE TABLE IF NOT EXISTS entries (
          --- entry data
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

          --- extra metadata
          -- server data in JSON format
          -- - fetched_at: when it was last fetched
          -- - added_at: when it was first added to db
          -- - summary_hash: hash value of the summary
          -- - contents_hash: hash value of the summary
          server_data TEXT,

          -- user data used by client in JSON format
          user_data TEXT,

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
      self.db.execute('''
        -- Indexes for accessing entries by updated_at efficiently
        CREATE INDEX IF NOT EXISTS entries_by_updated_at on entries(updated_at)
      ''')
    except Exception as e:
      logging.critical(f"Error init db: {e}")
      sys.exit(1)

  async def archive_content(self, session, feed_url: str, content, base_url: str | None, user_data: dict):
    if content.get("type") != "text/plain":
      content["value"] = await self.archiver.archive_html(session, feed_url, content.get("value"), base_url, user_data)
    return content

  async def archive_contents(self, session, feed_url: str, contents, base_url: str | None, user_data: dict):
    await asyncio.gather(
      *map(
        lambda c: self.archive_content(session, feed_url, c, base_url, user_data),
        contents
      )
    )
    return contents

  """
  Fetch feeds.
  If feeds is None, fetch all feeds
  """
  async def fetch_feeds(self, feeds: list, archive: bool, force_archive: bool):
    async with aiohttp.ClientSession(headers=self.headers, timeout=self.timeout) as session:
      feeds = feeds or self.get_feeds_metadata()
      feeds = await asyncio.gather(*map(partial(parse_feed, session), feeds))
      now = datetime.now().astimezone().isoformat()
      update_feed_field = partial(sql_update_field, "feeds")
      update_entry_field = partial(sql_update_field, "entries")

      for url, f_user_data, f in feeds:
        if f.bozo:
          err_msg = getattr(f.bozo_exception, 'message', str(f.bozo_exception))
          # don't raise exception as the feed may still be readable
          msg = f"Error parsing feed {url}: {err_msg}"
          logging.warning(msg)

        logging.info(f"Processing feed {url}...")

        # unpacked already when converting to row dict
        f_data = self.db.execute(
          "SELECT server_data, user_data FROM feeds WHERE url = ?",
          (url,)
        ).fetchone()
        f_server_data = f_data["server_data"] if f_data else {}
        f_user_data = f_user_data or (f_data["user_data"] if f_data else {})

        f_server_data["fetched_at"] = now
        if "added_at" not in f_server_data:
          f_server_data["added_at"] = now

        self.db.execute(
          f'''
          INSERT INTO feeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(url) DO UPDATE SET
              {update_feed_field("link")},
              {update_feed_field("author")},
              {update_feed_field("title")},
              {update_feed_field("subtitle")},
              {update_feed_field("logo")},
              {update_feed_field("published_at")},
              {update_feed_field("updated_at")},
              -- extra metadata
              {update_feed_field("server_data")},
              {update_feed_field("user_data")}
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
            pack_data(f_server_data),
            pack_data(f_user_data)
          )
        )

        # TODO: parallelize fetching
        for e in f.entries:
          e_id = e.get("id", e.link)
          e_title = e.get("title", e_id)
          logging.debug(f'Processing entry {e_title}...')

          # unpacked already when converting to row dict
          e_data = self.db.execute(
            "SELECT server_data, user_data FROM entries WHERE feed_url = ? and id = ?",
            (url, e_id)
          ).fetchone()
          e_server_data = e_data["server_data"] if e_data else {}
          e_user_data = e_data["user_data"] if e_data else {}

          e_server_data["fetched_at"] = now
          if "added_at" not in e_server_data:
            e_server_data["added_at"] = now


          # base url for feed resources
          base_url = e.get("link")
          summary = e.get("summary_detail")
          contents = e.get("content")
          summary_hash = hash_dicts([summary]) if summary else None
          contents_hash = hash_dicts(contents) if contents else None
          if archive:
            if summary and (summary_hash != e_server_data.get("summary_hash")
                            or force_archive):
              logging.info(f'Archiving summary of entry {e_title}...')
              summary = await self.archive_content(session, url, summary, base_url, f_user_data)
              e_server_data["summary_hash"] = summary_hash
            else:
              # don't update summary
              summary = None
            if contents and (contents_hash != e_server_data.get("contents_hash")
                             or force_archive):
              logging.info(f'Archiving contents of entry {e_title}...')
              contents = await self.archive_contents(session, url, contents, base_url, f_user_data)
              e_server_data["contents_hash"] = contents_hash
            else:
              # don't update contents
              contents = None

          self.db.execute(
            f'''
            INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                {update_entry_field("server_data")}
            ''',
            (
              url,
              e_id,
              e.get("link"),
              e.get("author"),
              e.get("title"),
              pack_data(summary),
              pack_data(contents),
              pack_data(e.get("enclosures")),
              parsed_time_to_iso(e.get("published_parsed")),
              parsed_time_to_iso(e.get("updated_parsed")),
              pack_data(e_server_data),
              None
            )
          )
      # insert will create a tx. Must commit to save data
      self.db.commit()

  def get_feeds_metadata(self) -> list[str]:
    # result is a dict after dict_row_factory
    return self.db.execute("SELECT url, user_data FROM feeds").fetchall()

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
    query += " ORDER BY COALESCE(published_at, updated_at) DESC LIMIT ? OFFSET ?"
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

  # archive feeds in database
  async def archive_feeds(self, feed_urls: Iterable[str] | None = None):
    urls = feed_urls or map(lambda v: v["url"], self.get_feeds_metadata())

    async with aiohttp.ClientSession(headers=self.headers, timeout=self.timeout) as session:
      for url in urls:
        for f in self.db.execute(
          "SELECT user_data FROM feeds WHERE url = ?",
          (url,)
        ):
          f_user_data = f["user_data"] or {}
          for e in self.db.execute(
            "SELECT id, link, summary, contents FROM entries WHERE feed_url = ?",
            (url,)
          ):
            base_url = e["link"]
            e_id = e["id"]
            summary = e["summary"]
            contents = e["contents"]
            if summary:
              logging.info(f'Archiving summary of entry {e_id}...')
              summary = await self.archive_content(session, url, summary, base_url, f_user_data)
            if contents:
              logging.info(f'Archiving contents of entry {e_id}...')
              contents = await self.archive_contents(session, url, contents, base_url, f_user_data)

            self.db.execute(
              f'''
              UPDATE entries
              SET summary = ?, contents = ?
              WHERE feed_url = ? AND id = ?
              ''',
              (
                pack_data(summary),
                pack_data(contents),
                url,
                e_id
              )
            )
      self.db.commit()
