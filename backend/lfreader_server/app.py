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
from fastapi.openapi.docs import (
  get_swagger_ui_html,
  get_swagger_ui_oauth2_redirect_html
)
import logging
import os
import sys
from pydantic import BaseModel
from sqlite3 import DatabaseError
from typing import Annotated
import traceback
import uvicorn

from .storage import Storage

# the path of the database (default to ./db.sqlite)
db_file = os.getenv("LFREADER_DB", "db.sqlite")
archive_dir = os.getenv("LFREADER_ARCHIVE", "archives")
# set user agent to prevent being blocked by source sites
user_agent = os.getenv("LFREADER_USER_AGENT") or None
log_level = os.getenv("LFREADER_LOG_LEVEL", "info") or None
# timeout for http requests in seconds
timeout = int(os.getenv("LFREADER_TIMEOUT") or "10")
swagger_js_url = os.getenv("LFREADER_SWAGGER_JS_URL", "https://unpkg.com/swagger-ui-dist@5.16.0/swagger-ui-bundle.js")
swagger_css_url = os.getenv("LFREADER_SWAGGER_CSS_URL", "https://unpkg.com/swagger-ui-dist@5.16.0/swagger-ui.css")

if log_level:
  logging.basicConfig(level=log_level.upper())

app = FastAPI(root_path="/api", docs_url=None, redoc_url=None)

# self-host js and css assets for Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
  return get_swagger_ui_html(
    openapi_url=app.root_path + app.openapi_url,
    title=app.title + " - Swagger UI",
    oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
    swagger_js_url=swagger_js_url,
    swagger_css_url=swagger_css_url,
    swagger_favicon_url="/logo.svg"
  )

@app.get(app.swagger_ui_oauth2_redirect_url, include_in_schema=False)
async def swagger_ui_redirect():
    return get_swagger_ui_oauth2_redirect_html()


storage = Storage(
  db_file,
  archive_dir,
  archive_url="/archives",
  user_agent=user_agent,
  timeout=timeout
)

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
  # whether to force archiving even if content doesn't change
  force_archive: bool = False

"""
Fetch feeds and their entries from origin (can be new feeds)
"""
@app.post("/")
async def fetch_api(args: FetchArgs):
  await storage.fetch_feeds(args.feed_urls, args.archive, args.force_archive)
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
async def db_exception(request, err: DatabaseError):
  traceback.print_exc()
  raise HTTPException(status_code=409, detail=f"Database Error: {err}")


def main():
  # pass this app as first arg in uvicorn
  sys.argv.insert(1, "lfreader_server.app:app")
  uvicorn.main()

