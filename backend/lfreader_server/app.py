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

from fastapi import FastAPI, Query, HTTPException
from fastapi.openapi.docs import (
  get_swagger_ui_html,
  get_swagger_ui_oauth2_redirect_html
)
import logging
import os
import sys
from pydantic import BaseModel, ValidationError
import sqlite3
import aiohttp
from typing import Annotated, Literal
import traceback
import uvicorn
import json
from enum import Enum

from .storage import Storage
from .config import Config

try:
  config_file = os.getenv("LFREADER_CONFIG", "")
  if config_file:
    with open(config_file) as f:
      config = Config(**json.load(f))
  else:
    config = Config()
except ValidationError as e:
  print(e.errors())
  sys.exit(1)

logging.basicConfig(level=config.log_level.upper())
if config_file:
  logging.info(f"Config file loaded: {config_file}")

app = FastAPI(root_path="/api", docs_url=None, redoc_url=None)

# self-host js and css assets for Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
  return get_swagger_ui_html(
    openapi_url=app.root_path + app.openapi_url,
    title=app.title + " - Swagger UI",
    oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
    swagger_js_url=config.swagger.js_url,
    swagger_css_url=config.swagger.css_url,
    swagger_favicon_url="/logo.svg"
  )

@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()


storage = Storage(config)

"""
Get feeds from local database
"""
@app.get("/feeds")
async def get_feeds_api() -> list[dict]:
  return storage.get_feeds()


class UpdateFeedArgs(BaseModel):
  # put it in body to prevent encoding
  url: str
  user_data: dict

  # allow using subscript to access
  def __getitem__(self, item):
    return getattr(self, item)

"""
Update feed user_data
"""
@app.put("/feeds")
async def update_feed_api(args: UpdateFeedArgs):
  storage.update_feed(args.url, args.user_data)
  return {}


"""
Get entries from local database
"""
@app.get("/entries")
async def get_entries_api(
  # for list type, must annotate with Query explicitly
  feed_urls: Annotated[list[str], Query()] = None,
  offset: int = -1,
  limit: int = -1
) -> list[dict]:
  return storage.get_entries(feed_urls, offset, limit)


class FetchArgs(BaseModel):
  # specific feed URLs
  feeds: list[UpdateFeedArgs] | None = None
  # whether to archive resources
  archive: bool = True
  # whether to force archiving even if content doesn't change
  force_archive: bool = False
  ignore_error: bool = False

"""
Fetch feeds and their entries from origin (can be new feeds)
"""
@app.post("/")
async def fetch_api(args: FetchArgs):
  await storage.fetch_feeds(args.feeds, args.archive, args.force_archive, args.ignore_error)
  return {}

"""
Delete feeds and their entries
"""
@app.delete("/")
async def delete_api(feed_urls: Annotated[list[str], Query()]):
  storage.delete_feeds(feed_urls)
  return {}


class ArchiveArgs(BaseModel):
  operation: Literal["archive"]
  feed_urls: list[str] | None = None


"""
Update (re-archive) feeds and entries in db
"""
@app.patch("/")
async def patch_api(args: ArchiveArgs):
  match args.operation:
    case "archive":
      await storage.archive_feeds(args.feed_urls)
    case _:
      raise HTTPException(status_code=400, detail=f"Invalid operation: {args.operation}")
  return {}

## Error handlers

@app.exception_handler(sqlite3.DatabaseError)
async def db_exception(request, err: sqlite3.DatabaseError):
  traceback.print_exc()
  raise HTTPException(status_code=409, detail=f"Database Error: {err}")

@app.exception_handler(aiohttp.ClientError)
async def db_exception(request, err: aiohttp.ClientError):
  raise HTTPException(status_code=400, detail=f"HTTP Error: {err}")

def main():
  # pass this app as first arg in uvicorn
  sys.argv.insert(1, "lfreader_server.app:app")
  uvicorn.main()

