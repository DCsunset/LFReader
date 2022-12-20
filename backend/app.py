from reader import make_reader, Reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import threading
import os 
from encoder import encode_entry, encode_feed, DecodeError
from pydantic import BaseModel
import dataclasses

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
YAFR_DB = os.getenv("YAFR_DB", "db.sqlite")
YAFR_NO_OPENAPI = os.getenv("YAFR_NO_OPENAPI")
logging.info(f"Database path: {YAFR_DB}")

fastapi_args = {}
if YAFR_NO_OPENAPI is not None:
	# Disable openapi and docs in production
	fastapi_args["openapi_url"] = None

app = FastAPI(**fastapi_args)

# each thread must have a different reader because of SQLite3
readers = {}

def get_reader() -> Reader:
	thread_id = threading.local()
	if not (thread_id in readers):
		readers[thread_id] = make_reader(YAFR_DB)
	return readers[thread_id]

## Feed API

# query type by tag 
QueryTags = None | bool | list[str|bool|list[str|bool]]

class FeedUpdateArgs(BaseModel):
	# specific feed URLs
	feeds: list[str]
	# Tags to add
	tags: list[str] | None = None


def add_feed_tags(reader: Reader, feed: Feed):
	data = dataclasses.asdict(feed)
	data["tags"] = list(reader.get_tag_keys(feed.url))
	return data

def add_entry_feed_url(reader: Reader, entry: Entry):
	data = dataclasses.asdict(entry)
	data["feed_url"] = entry.feed_url
	return data

"""
Get feeds
"""
@app.get("/feeds")
async def get_feeds_api(feed: str | None = None, tags: QueryTags = None):
	reader = get_reader()

	feeds = list(map(
		lambda f: add_feed_tags(reader, f),
		reader.get_feeds(feed=feed, tags=tags)
	))
	return encode_feed(feeds)

def update_feeds(reader: Reader, args: FeedUpdateArgs | None):
	if args is None:
		# update all feed entries
		reader.update_feeds()
	else:
		# set tag
		if args.tags is not None:
			for feed in args.feeds:
				orig_tags = reader.get_tag_keys(feed)
				# delete old tags first
				for tag in orig_tags:
					reader.delete_tag(feed, tag)
				# add new tags
				for tag in args.tags:
					reader.set_tag(feed, tag)

		# update feed entries
		for feed in args.feeds:
			reader.update_feeds(feed=feed)


"""
Update feeds
"""
@app.put("/feeds")
async def update_feeds_api(args: FeedUpdateArgs | None = None):
	reader = get_reader()
	update_feeds(reader, args)
	return {}

"""
Add new feeds
"""
@app.post("/feeds")
async def add_feeds_api(args: FeedUpdateArgs):
	reader = get_reader()
	for feed in args.feeds:
		reader.add_feed(feed)
	update_feeds(reader, args)
	return {}

"""
Delete feeds
"""
@app.delete("/feeds")
async def delete_feeds(feeds: list[str]):
	reader = get_reader()
	for feed in feeds:
		reader.delete_feed(feed)
	return {}
	
## Entry API

@app.get("/entries")
# Unpack FeedQueryArgs
async def get_entries_api(feed: str | None = None, tags: QueryTags = None):
	reader = get_reader()
	
	entries = list(map(
		lambda e: add_entry_feed_url(reader, e),
		reader.get_entries(feed=feed, feed_tags=tags)
	))
	return encode_entry(entries)


## Error handlers

@app.exception_handler(FeedNotFoundError)
async def feed_not_found_error(request, err: FeedNotFoundError):
	return PlainTextResponse(err.message, status_code=404)

@app.exception_handler(FeedExistsError)
async def feed_exists_error(request, err: FeedExistsError):
	return PlainTextResponse(err.message, status_code=409)

@app.exception_handler(InvalidFeedURLError)
async def invalid_feed_url_error(request, err: InvalidFeedURLError):
	return PlainTextResponse(err.message, status_code=400)

@app.exception_handler(ParseError)
async def parse_error(request, err: ParseError):
	return PlainTextResponse(err.message, status_code=400)

@app.exception_handler(DecodeError)
async def decode_error(request, err: DecodeError):
	return PlainTextResponse(str(err), status_code=400)
	
## Overwrite default error handler
@app.exception_handler(StarletteHTTPException)
async def http_exception(request, err: StarletteHTTPException):
	return PlainTextResponse(str(err.detail), status_code=err.status_code)

@app.exception_handler(RequestValidationError)
async def request_validation_error(request, err: RequestValidationError):
	return PlainTextResponse(str(err), status_code=400)

