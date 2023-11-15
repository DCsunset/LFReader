from fastapi import FastAPI, Query
from fastapi.responses import PlainTextResponse
import logging
import os
from pathlib import Path
from storage import Storage
from pydantic import BaseModel
from sqlite3 import DatabaseError
from typing import Annotated

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
db_file = os.getenv("LFREADER_DB", "db.sqlite")
archive_dir = os.getenv("LFREADER_ARCHIVE", "archives")
# default to: Chrome 119.0.0, Windows
# set user agent to prevent being blocked by source sites
user_agent = os.getenv("USER_AGENT", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")

Path(archive_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(root_path="/api")
storage = Storage(db_file, archive_dir, "/static/archives/", user_agent)

## Feed API

class FeedArgs(BaseModel):
  # specific feed URLs
  feed_urls: list[str] | None = None

"""
Get feeds
"""
@app.get("/feeds")
async def get_feeds_api() -> list[dict]:
  return storage.get_feeds()

"""
Add (or update) new feeds
"""
@app.post("/feeds")
async def update_feeds_api(args: FeedArgs) -> dict:
  await storage.update_feeds(args.feed_urls)
  return {}

"""
Delete feeds
"""
@app.delete("/feeds")
async def delete_entries_api(feed_urls: Annotated[list[str], Query()]) -> dict:
  storage.delete_feeds(feed_urls)
  return {}


## Entry API

@app.get("/entries")
async def get_entries_api(feed_urls: Annotated[list[str], Query()] | None = None) -> list[dict]:
  return storage.get_entries(feed_urls)


## Error handlers

@app.exception_handler(DatabaseError)
async def db_exception(request, err: DatabaseError) -> PlainTextResponse:
  return PlainTextResponse(f"Database Error: {err}", status_code=409)
