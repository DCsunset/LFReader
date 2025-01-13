#!/usr/bin/env python

import sqlite3
import sys
import re
from pathlib import Path
from hashlib import blake2s

if len(sys.argv) != 3:
  print("Usage: lookup_resource.py <db> <filename>")

db_file = sys.argv[1]
if not Path(db_file).exists():
  print("Db file doesn't exist")
  sys.exit(1)
filename = Path(sys.argv[2]).name

db = sqlite3.connect(db_file)
db.row_factory = sqlite3.Row

base_url = "/archives"

def filename_from_url(url: str):
  name = Path(url).name
  if url.startswith(base_url) and re.match("[0-9a-f]{64}", name):
    return name
  # only keep short extension as filename might be too long for os
  ext = Path(name).suffix
  if len(ext) > 8:
    ext = ""
  digest = blake2s(url.encode()).hexdigest()
  return  f"{digest}{ext}"

cnt = 1
for r in db.execute('''
  SELECT resources.feed_url, feeds.title AS feed_title, entry_id, entries.title AS entry_title, resources.url FROM resources
    INNER JOIN feeds ON resources.feed_url = feeds.url
    LEFT JOIN entries ON resources.entry_id = entries.id
'''):
  if filename_from_url(r["url"]) == filename:
    print(f"Ref {cnt}:")
    print(f"  URL: {r['url']}")
    print(f"  Feed: {r['feed_title']} ({r['feed_url']})")
    print(f"  Entry: {r['entry_title']} ({r['entry_id']})")
    cnt += 1

