import sqlite3
import sys
from pathlib import Path

db_file = sys.argv[1]
if not Path(db_file).exists():
  print("db file doesn't exist")
  sys.exit(1)

db = sqlite3.connect(db_file)
# disable it during migration as old database might have violations
db.execute("PRAGMA foreign_keys = OFF")

db.execute("ALTER TABLE entries RENAME TO old_entries")
db.execute("ALTER TABLE resources RENAME TO old_resources")

db.execute('''
  CREATE TABLE IF NOT EXISTS entries (
    --- entry data
    feed_url TEXT NOT NULL,
    id TEXT NOT NULL,
    link TEXT,
    author TEXT,
    title TEXT,
    categories TEXT,  -- JSON string
    summary TEXT,  -- JSON string
    contents TEXT,  -- JSON string
    enclosures TEXT,  -- JSON string
    published_at TEXT,  -- ISO DateTime
    updated_at TEXT,  -- ISO DateTime

    --- extra metadata
    -- server data in JSON format
    -- - fetched_at: when it was last fetched
    -- - added_at: when it was first added to db
    -- - summary_hash: hash value of summary
    -- - contents_hash: hash value of contents
    -- - enclosures_hash: hash value of enclosures
    server_data TEXT,

    -- user data used by client in JSON format
    user_data TEXT,

    PRIMARY KEY (feed_url, id),
    -- Use RESTRICT to prevent accidental deletion
    FOREIGN KEY (feed_url) REFERENCES feeds(url)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
''')

# add foreign key constraints
db.execute('''
  -- Record references to resources
  CREATE TABLE IF NOT EXISTS resources (
    feed_url TEXT NOT NULL,
    entry_id TEXT NOT NULL,  -- could be entry_id or empty string to denote feed itself (shouldn't be null as it's used as primary key)
    url TEXT NOT NULL,  -- original resource url (or archived url for backward compatibility)

    PRIMARY KEY (feed_url, entry_id, url),
    FOREIGN KEY (feed_url) REFERENCES feeds(url)
      ON UPDATE CASCADE
      ON DELETE RESTRICT,
    FOREIGN KEY (feed_url, entry_id) REFERENCES entries(feed_url, id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
''')

# indexes for entries table
db.execute('''
  CREATE INDEX IF NOT EXISTS entries_by_feed_url ON entries(feed_url)
''')
db.execute('''
  CREATE INDEX IF NOT EXISTS entries_by_published_at ON entries(published_at)
''')
db.execute('''
  CREATE INDEX IF NOT EXISTS entries_by_updated_at ON entries(updated_at)
''')
# indexes for resources table
db.execute('''
  CREATE INDEX IF NOT EXISTS resources_by_feed_url ON resources(feed_url)
''')
db.execute('''
  CREATE INDEX IF NOT EXISTS resources_by_entry_id ON resources(feed_url, entry_id)
''')
db.execute('''
  CREATE INDEX IF NOT EXISTS resources_by_url ON resources(url)
''')

# migrate data
db.execute("INSERT INTO entries SELECT * FROM old_entries")
# add empty entry to denote the feed itself for resources foreign key
for r in db.execute("SELECT url FROM feeds"):
  url = r[0]
  db.execute("INSERT OR IGNORE INTO entries(feed_url, id) VALUES (?, ?)", (url, ""))

db.execute("INSERT INTO resources SELECT * FROM old_resources")
# fix old @ entries
db.execute("UPDATE resources SET entry_id = '' WHERE entry_id = '@'")

db.execute("DROP TABLE old_entries")
db.execute("DROP TABLE old_resources")

db.commit()

