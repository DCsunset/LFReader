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


### Update Feed API

class UpdateFeedArgs(BaseModel):
  # put it in body to prevent encoding
  url: str
  user_data: dict

  # allow using subscript to access
  def __getitem__(self, item):
    return getattr(self, item)


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


### Fetch feeds API

class FetchArgs(BaseModel):
  # specific feed URLs
  feeds: list[UpdateFeedArgs] | None = None
  # whether to archive resources
  archive: bool = True
  # whether to force archiving even if content doesn't change
  force_archive: bool = False
  ignore_error: bool = False


### Archive API

class ArchiveArgs(BaseModel):
  operation: Literal["archive"]
  feed_urls: list[str] | None = None


