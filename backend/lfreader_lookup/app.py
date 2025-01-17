# LFReader
# Copyright (C) 2025  DCsunset

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
import sys
import re
from pathlib import Path
from hashlib import blake2s
import argparse


def main():
  parser = argparse.ArgumentParser(
    description="Look up resource file reference in the database",
    formatter_class=argparse.ArgumentDefaultsHelpFormatter
  )
  parser.add_argument("-b", "--base-url", default="/archives", help="Base URL used to archive resources")
  parser.add_argument("database", help="SQLite database file")
  parser.add_argument("resource", help="Resource filename (no need to specify full path)")
  args = parser.parse_args()

  if not Path(args.database).exists():
    print("Db file doesn't exist")
    sys.exit(1)
  filename = Path(args.resource).name

  db = sqlite3.connect(args.database)
  db.row_factory = sqlite3.Row

  def filename_from_url(url: str):
    name = Path(url).name
    if url.startswith(args.base_url) and re.match("[0-9a-f]{64}", name):
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

if __name__ == "__main__":
  main()

