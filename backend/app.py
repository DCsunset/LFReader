from reader import make_reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import base64
import threading
import os 
from encoder import encode_data, encode_id, decode_id, DecodeError

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

def get_reader():
	thread_id = threading.local()
	if not (thread_id in readers):
		readers[thread_id] = make_reader(YAFR_DB)
	return readers[thread_id]

## Feed API
@app.get("/feeds")
async def get_feeds():
	reader = get_reader()
	feeds = reader.get_feeds()
	return encode_data(feeds, exclude_none=True)

@app.get("/feeds/{encoded_id}")
async def get_feed(encoded_id):
	reader = get_reader()
	feed_id = decode_id(encoded_id)
	feed = reader.get_feed(feed_id)
	return encode_data(feed, exclude_none=True)

@app.put("/feeds/{encoded_id}")
async def update_feed(encoded_id):
	reader = get_reader()
	feed_id = decode_id(encoded_id)
	reader.update_feed(feed_id)
	return {}

@app.post("/feeds/{encoded_id}")
async def add_feed(encoded_id):
	reader = get_reader()
	feed_id = decode_id(encoded_id)
	reader.add_feed(feed_id)
	reader.update_feed(feed_id)
	return {}

@app.delete("/feeds/{encoded_id}")
async def delete_feed(encoded_id):
	reader = get_reader()
	feed_id = decode_id(encoded_id)
	reader.delete_feed(feed_id)
	return {}
	
## Entry API
@app.get("/entries")
async def get_entries():
	reader = get_reader()
	entries = reader.get_entries()
	return encode_data(entries, exclude={"feed"}, exclude_none=True)


## Error handlers
@app.exception_handler(FeedNotFoundError)
async def feed_not_foundi_error(request, err: FeedNotFoundError):
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

