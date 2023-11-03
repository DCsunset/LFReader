import sqlite3
import logging
import sys
import json
from typing import Iterable, Any
from itertools import product
import feedparser
from datetime import datetime
from time import mktime, struct_time
from functools import partial

def parsed_time_to_iso(parsed_time: struct_time | None):
  return parsed_time and datetime.utcfromtimestamp(mktime(parsed_time)).isoformat()

# pack data into JSON string
def pack_data(value):
  # use None for empty value (e.g. [], "", None)
  if not value:
    return None
  return json.dumps(value)

# unpack JSON data in row
def unpack_data(key, value):
  json_fields = { "user_data", "enclosures", "contents" }
  if key in json_fields:
    return value and json.loads(value)
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
  def __init__(self, dbFile: str):
    self.db = sqlite3.connect(dbFile)
    self.db.row_factory = dict_row_factory
    self.init_db()
    logging.info(f"Database path: {dbFile}")

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
          fetched_at TEXT,  -- when this feed is last fetched
          added_at TEXT,  -- when this feed is first added to db
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
          summary TEXT,
          contents TEXT,  -- JSON string
          enclosures TEXT,  -- JSON string
          published_at TEXT,  -- ISO DateTime
          updated_at TEXT,  -- ISO DateTime

          -- extra metadata
          fetched_at TEXT,  -- when this entry is last fetched
          added_at TEXT,  -- when this entry is first added to db
          user_data TEXT,  -- custom user data in JSON format

          PRIMARY KEY (feed_url, id),
          FOREIGN KEY (feed_url) REFERENCES feeds(url)
            ON UPDATE CASCADE
            ON DELETE CASCADE
        )
      ''')
      self.db.execute('''
        -- Indexes for fast lookup
        CREATE INDEX IF NOT EXISTS entries_by_feed on entries(feed_url)
      ''')
    except Exception as e:
      logging.critical(f"Error init db: {e}")
      sys.exit(1)

  def add_feeds(self, feed_urls: Iterable[str]):
    feeds = map(lambda url: (url, feedparser.parse(url)), feed_urls)
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
      self.db.executemany(
        f'''
        INSERT OR REPLACE INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        map(lambda e: (
          url,
          e.id,
          e.get("link"),
          e.get("author"),
          e.get("title"),
          e.get("summary"),
          pack_data(e.get("content")),
          pack_data(e.get("enclosures")),
          parsed_time_to_iso(e.get("published_parsed")),
          parsed_time_to_iso(e.get("updated_parsed")),
          now,
          now,
          None
        ), f.entries)
      )
    # insert will create a tx. Must commit to save data
    self.db.commit()

  def get_feeds(self) -> list[dict[str, Any]]:
    # result is a dict after dict_row_factory
    return self.db.execute("SELECT * FROM feeds").fetchall()

  def get_entries(self, feed_urls: list[str] | None = None) -> list[dict[str, Any]]:
    if feed_urls is None:
      qs  = ""
    else:
      # use placeholder to prevent SQL injection
      qs = "WHERE feed_url IN ({})".format(", ".join("?"))
    return self.db.execute(f"SELECT * FROM entries {qs}", feed_urls).fetchall()

  def delete_feeds(self, feed_urls: list[str]):
    qs = "WHERE url IN ({})".format(", ".join("?"))
    self.db.execute(f"DELETE FROM feeds {qs}", feed_urls)
    # delete will create a tx. Must commit to save data
    self.db.commit()

  def delete_entries(self, feed_urls: list[str]):
    qs = "WHERE feed_url IN ({})".format(", ".join("?"))
    self.db.execute(f"DELETE FROM entries {qs}", feed_urls)
    # delete will create a tx. Must commit to save data
    self.db.commit()

