import sqlite3
import sys
import json
from pathlib import Path
from functools import partial
from bs4 import BeautifulSoup
from base64 import urlsafe_b64encode, urlsafe_b64decode
import re
import warnings

def encode_feed_url(feed_url: str) -> str:
  return urlsafe_b64encode(feed_url.encode()).decode().rstrip("=")

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
    "enclosures": [],
    "contents": [],
    "summary": None,
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
def sql_update_field_new(table: str, field: str):
  return f"{field} = COALESCE({table}.{field}, excluded.{field})"

# SQL query that updates field by coalescing with old fields
def sql_update_field_old(table: str, field: str):
  return f"{field} = COALESCE(excluded.{field}, {table}.{field})"

def init_db(db):
  db.execute('''
    CREATE TABLE IF NOT EXISTS feeds (
      --- feed data ---
      url TEXT PRIMARY KEY,
      link TEXT,
      author TEXT,
      title TEXT,
      subtitle TEXT,
      categories TEXT,  -- JSON string
      generator TEXT,
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
      FOREIGN KEY (feed_url) REFERENCES feeds(url)
        ON UPDATE CASCADE
        ON DELETE CASCADE
    )
  ''')
  db.execute('''
    -- Record references to resources
    CREATE TABLE IF NOT EXISTS resources (
      feed_url TEXT NOT NULL,
      entry_id TEXT NOT NULL,  -- could be entry_id or emptry string '' to denote feed itself (shouldn't be null as it's used as primary key)
      url TEXT NOT NULL,  -- original resource url (or archived url for backward compatibility)

      PRIMARY KEY (feed_url, entry_id, url),
      FOREIGN KEY (feed_url) REFERENCES feeds(url)
        ON UPDATE CASCADE
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



old_file = sys.argv[1]
if not Path(old_file).exists():
  print("Old db file doesn't exist")
  sys.exit(1)
new_file = sys.argv[2]
if Path(new_file).exists():
  print("New db file exists already")
  sys.exit(1)

old_db = sqlite3.connect(old_file)
new_db = sqlite3.connect(new_file)
init_db(new_db)

old_db.row_factory = dict_row_factory
new_db.row_factory = dict_row_factory

update_entry_field_new = partial(sql_update_field_new, "entries")
update_entry_field_old = partial(sql_update_field_old, "entries")

for f in old_db.execute("SELECT * FROM feeds"):
  new_db.execute(
    f'''
    INSERT INTO feeds VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
      f["url"],
      f["link"],
      f["author"],
      f["title"],
      f["subtitle"],
      None,
      None,
      f["logo"],
      f["published_at"],
      f["updated_at"],
      f["server_data"],
      f["user_data"]
    )
  )
  new_db.commit()


# change this if needed
base_url = "/archives"
base_dir = "archives"
archive_options = [
  {
    "attr": "src"
  },
  {
    "attr": "href",
    "attr_filters": {
      "href": "\\.(zip|jpg|jpeg|png|webp|mp3)$"
    }
  }
]

def add_resource(db, feed_url, entry_id, url):
  db.execute(
    f'''
    INSERT OR IGNORE INTO resources VALUES (?, ?, ?)
    ''',
    (
      feed_url,
      entry_id,
      url
    )
  )

def check_enclosure(db, feed_url, entry_id, enclosure):
  encoded_feed_url = encode_feed_url(feed_url)
  feed_path = Path(base_dir).joinpath(encoded_feed_url)
  base_path = Path(base_dir)
  resource_base_url = f"{base_url}/{encoded_feed_url}"

  src = enclosure["href"]
  # check if url is archived
  if src.startswith(resource_base_url):
    filename = Path(src).name
    # start with 64 hex digit
    if re.match("[0-9a-f]{64}", filename):
      # search for file started with it for backward compatibility
      # longer filename first (new version)
      found = False
      for f in sorted(feed_path.iterdir(), key=lambda p: len(p.name), reverse=True):
        if f.name.startswith(filename):
          # flatten layout
          new_name = base_path.joinpath(f.name)
          f.rename(new_name)
          # update enclosure url
          url = f"{base_url}/{f.name}"
          enclosure["href"] = url
          add_resource(db, feed_url, entry_id, url)
          found = True
          break
      if not found:
        # the resource may have been renamed already
        for f in base_path.iterdir():
          if f.name.startswith(filename):
            # update enclosure url
            url = f"{base_url}/{f.name}"
            enclosure["href"] = url
            add_resource(db, feed_url, entry_id, url)
            found = True
            break

      if not found:
        print(f"URL archived but resource not found: {src}")

def check_content(db, feed_url, entry_id, content):
  if content is None or content.get("type") == "text/plain":
    return

  encoded_feed_url = encode_feed_url(feed_url)
  feed_path = Path(base_dir).joinpath(encoded_feed_url)
  base_path = Path(base_dir)
  resource_base_url = f"{base_url}/{encoded_feed_url}"

  soup = BeautifulSoup(content["value"], "html.parser")
  for opt in archive_options:
    attr = opt["attr"]
    attrs = opt.get("attr_filters", {})
    if attr not in attrs:
      attrs[attr] = True
    for tag in soup.find_all(opt.get("tag_filter"), attrs=attrs):
      src = tag.get(attr)
      # check if url is archived
      if src.startswith(resource_base_url):
        filename = Path(src).name
        # start with 64 hex digit
        if re.match("[0-9a-f]{64}", filename):
          found = False
          # search for file started with it for backward compatibility
          for f in sorted(feed_path.iterdir(), key=lambda p: len(p.name), reverse=True):
            if f.name.startswith(filename):
              # flatten layout
              new_name = base_path.joinpath(f.name)
              f.rename(new_name)
              # update tag url
              url = f"{base_url}/{f.name}"
              tag[attr] = url
              add_resource(db, feed_url, entry_id, url)
              found = True
              break
          if not found:
            # the resource may have been renamed already
            for f in base_path.iterdir():
              if f.name.startswith(filename):
                # update enclosure url
                url = f"{base_url}/{f.name}"
                tag[attr] = url
                add_resource(db, feed_url, entry_id, url)
                found = True
                break

          if not found:
            print(f"URL archived but resource not found: {src}")
  content["value"] = str(soup)


for e in old_db.execute("SELECT * FROM entries"):
  summary = e["summary"]
  check_content(new_db, e["feed_url"], e["id"], summary)

  contents = e["contents"]
  for c in contents:
    check_content(new_db, e["feed_url"], e["id"], c)

  enclosures = e["enclosures"]
  for en in enclosures:
    check_enclosure(new_db, e["feed_url"], e["id"], en)

  new_db.execute(
    f'''
    INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''',
    (
      e["feed_url"],
      e["id"],
      e["link"],
      e["author"],
      e["title"],
      None,
      pack_data(summary),
      pack_data(contents),
      pack_data(enclosures),
      e["published_at"],
      e["updated_at"],
      e["server_data"],
      e["user_data"]
    )
  )
  new_db.commit()

