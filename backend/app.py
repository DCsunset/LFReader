from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import os
from storage import Storage
from pydantic import BaseModel
from sqlite3 import DatabaseError

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
YAFR_DB = os.getenv("YAFR_DB", "db.sqlite")

app = FastAPI()
storage = Storage(YAFR_DB)

## Feed API

class FeedArgs(BaseModel):
  # specific feed URLs
  feed_urls: list[str]

"""
Get feeds
"""
@app.get("/feeds")
async def get_feeds_api():
  return storage.get_feeds()

"""
Add (or update) new feeds
"""
@app.post("/feeds")
async def add_feeds_api(args: FeedArgs):
  storage.add_feeds(args.feed_urls)
  return {}

"""
Delete feeds
"""
@app.delete("/feeds")
async def delete_feeds_api(feeds: FeedArgs):
  storage.delete_feeds(args.feed_urls)
  return {}


## Entry API

@app.get("/entries")
# Unpack FeedQueryArgs
async def get_entries_api(feed_urls: list[str] | None = None):
  return storage.get_entries(feed_urls)


## Error handlers

@app.exception_handler(DatabaseError)
async def db_exception(request, err: DatabaseError):
  return PlainTextResponse(str(err), status_code=409)

# @app.exception_handler(FeedExistsError)
# async def feed_exists_error(request, err: FeedExistsError):
# 	return PlainTextResponse(err.message, status_code=409)

# @app.exception_handler(InvalidFeedURLError)
# async def invalid_feed_url_error(request, err: InvalidFeedURLError):
# 	return PlainTextResponse(err.message, status_code=400)

# @app.exception_handler(ParseError)
# async def parse_error(request, err: ParseError):
# 	return PlainTextResponse(err.message, status_code=400)

# ## Overwrite default error handler
# @app.exception_handler(StarletteHTTPException)
# async def http_exception(request, err: StarletteHTTPException):
# 	return PlainTextResponse(str(err.detail), status_code=err.status_code)

# @app.exception_handler(RequestValidationError)
# async def request_validation_error(request, err: RequestValidationError):
# 	return PlainTextResponse(str(err), status_code=400)

