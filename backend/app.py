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
# default to: Chrome 119.0.0, Windows
# set user agent to prevent being blocked by source sites
user_agent = os.getenv("USER_AGENT", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")

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
