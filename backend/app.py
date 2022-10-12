from reader import make_reader, Reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import threading
import os 
from encoder import encode_data, decode_id, DecodeError
from pydantic import BaseModel

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

class FeedArgs(BaseModel):
	tags: list[str] | None = None


"""
Get feeds
"""
@app.get("/feeds")
async def get_feeds_api():
	reader = get_reader()
	feeds = reader.get_feeds()
	return encode_data(feeds, exclude_none=True)

"""
Get a feed
"""
@app.get("/feeds/{encoded_id}")
async def get_feed_api(encoded_id: str):
	reader = get_reader()
	feed_url = decode_id(encoded_id)
	feed = reader.get_feed(feed_url)
	return encode_data(feed, exclude_none=True)


def update_feed(reader: Reader, feed_url: str, args: FeedArgs):
	# set tag
	if args.tags is not None:
		orig_tags = reader.get_tag_keys(feed_url)
		# delete old tags first
		for tag in orig_tags:
			reader.delete_tag(feed_url, tag)
		# add new tags
		for tag in args.tags:
			reader.set_tag(feed_url, tag)

	reader.update_feed(feed_url)


"""
Update a feed
"""
@app.put("/feeds/{encoded_id}")
async def update_feed_api(encoded_id: str, args: FeedArgs):
	feed_url = decode_id(encoded_id)
	reader = get_reader()
	update_feed(reader, feed_url, args)
	return {}

"""
Add a new feed
"""
@app.post("/feeds/{encoded_id}")
async def add_feed_api(encoded_id: str, args: FeedArgs):
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
async def get_entries_api():
	reader = get_reader()
	entries = reader.get_entries()
	return encode_data(entries, exclude={"feed"}, exclude_none=True)


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

