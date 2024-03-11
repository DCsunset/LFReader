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

from fastapi import FastAPI, Query
from fastapi.responses import PlainTextResponse
import logging
import os
from storage import Storage
from pydantic import BaseModel
from sqlite3 import DatabaseError
from typing import Annotated
import traceback

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
db_file = os.getenv("LFREADER_DB", "db.sqlite")
archive_dir = os.getenv("LFREADER_ARCHIVE", "archives")
# set user agent to prevent being blocked by source sites
user_agent = os.getenv("USER_AGENT", None)

app = FastAPI(root_path="/api")
storage = Storage(db_file, archive_dir, "/archives", user_agent)

"""
Get feeds from local database
"""
@app.get("/feeds")
async def get_feeds_api() -> list[dict]:
  return storage.get_feeds()


class UpdateFeedArgs(BaseModel):
  # put it in body to prevent encoding
  feed_url: str
  user_data: dict

"""
Update feed user_data
"""
@app.put("/feeds")
async def update_feed_api(args: UpdateFeedArgs):
  storage.update_feed(args.feed_url, args.user_data)
  return {}


"""
Get entries from local database
"""
@app.get("/entries")
async def get_entries_api(
    # for list type, must annotate with Query explicitly
    feed_urls: Annotated[list[str], Query()] | None = None,
    offset: int = -1,
    limit: int = -1
) -> list[dict]:
  return storage.get_entries(feed_urls, offset, limit)


class FetchArgs(BaseModel):
  # specific feed URLs
  feed_urls: list[str] | None = None
  # whether to archive resources
  archive: bool = True

"""
Fetch feeds and their entries from origin (can be new feeds)
"""
@app.post("/")
async def fetch_api(args: FetchArgs):
  await storage.fetch_feeds(args.feed_urls, args.archive)
  return {}

"""
Delete feeds
"""
@app.delete("/")
async def delete_api(feed_urls: Annotated[list[str], Query()]):
  storage.delete_feeds(feed_urls)
  return {}


## Error handlers

@app.exception_handler(DatabaseError)
async def db_exception(request, err: DatabaseError) -> PlainTextResponse:
  traceback.print_exc()
  return PlainTextResponse(f"Database Error: {err}", status_code=409)
