from reader import make_reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
import logging
import base64
import threading
import os 

logging.basicConfig(level=logging.INFO)

# the path of the database (default to ./db.sqlite)
YAFR_DB = os.getenv("YAFR_DB", "db.sqlite")
logging.info(f"Database path: {YAFR_DB}")

app = FastAPI()

# each thread must have a different reader because of SQLite3
readers = {}

def get_reader():
	thread_id = threading.local()
	if not (thread_id in readers):
		readers[thread_id] = make_reader(YAFR_DB)
	return readers[thread_id]

def feed_to_dict(feed: Feed):
	return {
		"url": feed.url,
		"title": feed.title,
		"subtitle": feed.subtitle,
		"author": feed.author,
		"updated": feed.updated
	}

def entry_to_dict(entry: Entry):
	return {
		"id": entry.id,
		"updated": entry.updated,
		"title": entry.title,
		"summary": entry.summary,
		"author": entry.author,
	}

def decode_id(data: str):
	return base64.decodebytes(data.encode("utf-8")).decode("utf-8")

def encode_id(id: str):
	return base64.encodebytes(data.encode("utf-8")).decode("utf-8")


## Feed API
@app.get("/feeds")
async def get_feeds():
	reader = get_reader()
	feeds = reader.get_feeds()
	return [feed_to_dict(feed) for feed in feeds]

@app.get("/feeds/{encoded_id}")
async def get_feed(encoded_id):
	reader = get_reader()
	feed_id = decode_id(encoded_id)
	feed = reader.get_feed(feed_id)
	return feed_to_dict(feed)

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
	return [entry_to_dict(entry) for entry in entries]


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
async def parse_error(e, ParseError):
	return PlainTextResponse(err.message, status_code=400)
	
