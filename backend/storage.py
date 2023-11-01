import sqlite3
import logging
import sys
import json
from typing import Iterable, Any
from itertools import starmap, product
import feedparser
from datetime import datetime
from time import mktime

# Download URL and save as file in resources
def download_url(url: str) -> str | None:
  return None

def parsed_time_to_iso(parsed_time):
  return datetime.utcfromtimestamp(mktime(time_struct)).isoformat()

# unpack JSON data in row
def unpack_data(key, value):
  json_fields = set("user_data", "enclosures", "contents")
  if key in json_fields:
    return value and json.loads(value)
  else:
    return value

# convert sqlite3 row into dict
def dict_row_factory(cursor: sqlite3.Cursor, row: sqlite3.Row):
  fields = [column[0] for column in cursor.description]
  return {key: unpack_data(key, value) for key, value in zip(fields, row)}

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
          added_at TEXT,  -- when this feed is added to db
          user_data TEXT  -- custom user data in JSON format
        )
      ''')
      self.db.execute('''
        CREATE TABLE IF NOT EXISTS entries (
          -- entry data
          feed_url TEXT NOT NULL,
          id TEXT NOT NULL,
          author TEXT,
          title TEXT,
          link TEXT,
          published_at TEXT,  -- ISO DateTime
          updated_at TEXT,  -- ISO DateTime
          contents TEXT,  -- JSON string
          enclosures TEXT,  -- JSON string
          summary TEXT,

          -- extra metadata
          fetched_at TEXT,  -- when this feed is last fetched
          added_at TEXT,  -- when this feed is added to db
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
    self.db.executemany(
      "INSERT INTO feeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      starmap(lambda url, f: (
        url,
        f.feed.link,
        f.feed.author,
        f.feed.title,
        f.feed.subtitle,
        download_url(f.feed.logo),
        parsed_time_to_iso(f.feed.published_parsed),
        parsed_time_to_iso(f.feed.updated_parsed),
        now,
        now
      ), feeds)
    )

    for url, feed in feeds:
      self.db.executemany(
        "INSERT INTO feeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        map(lambda e: (
          url,
          e.id,
          e.author,
          e.title,
          e.link,
          parsed_time_to_iso(e.published_parsed),
          parsed_time_to_iso(e.updated_parsed),
          json.dumps(e.content),
          json.dumps(e.enclosures),
          e.summary,
          now,
          now
        ), feed.entries)
      )

  def get_feeds(self) -> list[dict[str, Any]]:
    # result is a dict after dict_row_factory
    return self.db.execute("SELECT * FROM feeds").fetchall()

  def update_feeds(self, feed_urls: list[str] | None = None):
    # TODO
    pass

  def delete_feeds(self, feed_urls: list[str]):
    # TODO
    pass

  def get_entries(self, feed_urls: list[str] | None = None) -> list[dict[str, Any]]:
    if feed_urls is None:
      qs  = ""
    else:
      # use placeholder to prevent SQL injection
      qs = "WHERE feed_url IN ({})".format(", ".join("?"))
    return self.db.execute(f"SELECT * FROM entries {qs}", ).fetchall()

