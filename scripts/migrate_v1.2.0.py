import sqlite3
import sys
import json
from pathlib import Path
from functools import partial

# Migrate entries only

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
    "server_data": {}
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


old_file = sys.argv[1]
if not Path(old_file).exists():
  print("Old db file doesn't exist")
  sys.exit(1)
new_file = sys.argv[2]
if not Path(new_file).exists():
  print("New db file doesn't exist")
  sys.exit(1)

old_db = sqlite3.connect(old_file)
new_db = sqlite3.connect(new_file)
old_db.row_factory = dict_row_factory
new_db.row_factory = dict_row_factory

update_entry_field_new = partial(sql_update_field_new, "entries")
update_entry_field_old = partial(sql_update_field_old, "entries")

for e in old_db.execute("SELECT * FROM entries"):
  new_e = new_db.execute(
    "SELECT server_data FROM entries WHERE feed_url = ? AND id = ?",
    (e["feed_url"], e["id"])
  ).fetchone()
  server_data = new_e["server_data"] if new_e else {
    "fetched_at": e["fetched_at"]
  }
  server_data["added_at"] = e["added_at"]

  new_db.execute(
    f'''
    INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(feed_url, id) DO UPDATE SET
        {update_entry_field_old("link")},
        {update_entry_field_old("author")},
        {update_entry_field_old("title")},
        {update_entry_field_old("summary")},
        {update_entry_field_old("contents")},
        {update_entry_field_old("enclosures")},
        {update_entry_field_old("published_at")},
        {update_entry_field_old("updated_at")},
        -- extra metadata
        {update_entry_field_new("server_data")},
        {update_entry_field_old("user_data")}
    ''',
    (
      e["feed_url"],
      e["id"],
      e["link"],
      e["author"],
      e["title"],
      e["summary"],
      e["contents"],
      e["enclosures"],
      e["published_at"],
      e["updated_at"],
      pack_data(server_data),
      e["user_data"]
    )
  )
  new_db.commit()

