# LFReader
# Copyright (C) 2022-2025  DCsunset

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

from pydantic import BaseModel, ValidationError
from typing import Literal

### App State

class AppStatus(BaseModel):
  loading: bool

# App state
class AppState:
  status: AppStatus
  def __init__(self):
    self.status = AppStatus(loading=False)


### Query entries API

class QueryEntry(BaseModel):
  feed_url: str
  id: str

class QueryEntriesArgs(BaseModel):
  feed_urls: list[str] | None = None
  entries: list[QueryEntry] | None = None
  columns: list[str] | None = None
  offset: int = -1
  limit: int = -1


### Feed Action API (tagged union)

class FeedInfo(BaseModel):
  # put it in body to prevent encoding
  url: str
  user_data: dict

  # allow using subscript to access
  def __getitem__(self, item):
    return getattr(self, item)


class FetchFeedsArgs(BaseModel):
  action: Literal["fetch"]
  # specific feed URLs
  feeds: list[FeedInfo] | None = None
  # whether to archive resources
  archive: bool = True
  # whether to force archiving even if content doesn't change
  force_archive: bool = False
  ignore_error: bool = False

class ArchiveFeedsArgs(BaseModel):
  action: Literal["archive"]
  feed_urls: list[str] | None = None

class CleanFeedsArgs(BaseModel):
  action: Literal["clean"]
  feed_urls: list[str] | None = None

class DeleteFeedsArgs(BaseModel):
  action: Literal["delete"]
  feed_urls: list[str]

class UpdateFeedsArgs(BaseModel):
  action: Literal["update"]
  feeds: list[FeedInfo]

