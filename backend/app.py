from reader import make_reader, Reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import threading
import os 
from encoder import decode_id, encode_entry, encode_feed, DecodeError
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

class FeedUpdateArgs(BaseModel):
	tags: list[str] | None = None

class FeedQueryArgs(BaseModel):
	# query by tag in reader library
	tags: None | bool | list[str|bool|list[str | bool]] = None
	# a specific feed url
	feed: str | None = None


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
async def get_feeds_api(args: FeedQueryArgs | None = None):
	reader = get_reader()
	tags = getattr(args, "tags", None)
	feed = getattr(args, "feed", None)

	feeds = list(map(
		lambda f: add_feed_tags(reader, f),
		reader.get_feeds(feed=feed, tags=tags)
	))
	return encode_feed(feeds)

"""
Get a feed
"""
@app.get("/feeds/{encoded_id}")
async def get_feed_api(encoded_id: str):
	reader = get_reader()
	feed_url = decode_id(encoded_id)
	feed = add_feed_tags(reader, reader.get_feed(feed_url))
	return encode_feed(feed)


def update_feed(reader: Reader, feed_url: str, args: FeedUpdateArgs | None):
	reader.update_feed(feed_url)

	if args is None:
		return

	# set tag
	if args.tags is not None:
		orig_tags = reader.get_tag_keys(feed_url)
		# delete old tags first
		for tag in orig_tags:
			reader.delete_tag(feed_url, tag)
		# add new tags
		for tag in args.tags:
			reader.set_tag(feed_url, tag)


"""
Update a feed
"""
@app.put("/feeds/{encoded_id}")
async def update_feed_api(encoded_id: str, args: FeedUpdateArgs | None = None):
	feed_url = decode_id(encoded_id)
	reader = get_reader()
	update_feed(reader, feed_url, args)
	return {}

"""
Add a new feed
"""
@app.post("/feeds/{encoded_id}")
async def add_feed_api(encoded_id: str, args: FeedUpdateArgs | None = None):
	reader = get_reader()
	feed_url = decode_id(encoded_id)
	reader.add_feed(feed_url)
	update_feed(reader, feed_url, args)
	return {}

"""
Delete a feed
"""
@app.delete("/feeds/{encoded_id}")
async def delete_feed_api(encoded_id):
	reader = get_reader()
	feed_url = decode_id(encoded_id)
	reader.delete_feed(feed_url)
	return {}
	
## Entry API

@app.get("/entries")
async def get_entries_api(args: FeedQueryArgs | None = None):
	reader = get_reader()
	tags = getattr(args, "tags", None)
	feed = getattr(args, "feed", None)
	
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

