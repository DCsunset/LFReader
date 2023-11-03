from fastapi import FastAPI, Query
from fastapi.responses import PlainTextResponse
import logging
import os
from storage import Storage
from pydantic import BaseModel
from sqlite3 import DatabaseError
from typing import Annotated

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
dbFile = os.getenv("YAFR_DB", "db.sqlite")

app = FastAPI()
storage = Storage(dbFile)

## Feed API

class FeedArgs(BaseModel):
  # specific feed URLs
  feed_urls: list[str]

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
async def add_feeds_api(args: FeedArgs) -> dict:
  storage.add_feeds(args.feed_urls)
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
