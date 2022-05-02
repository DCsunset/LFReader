from reader import make_reader, Feed, Entry, FeedNotFoundError, StorageError, FeedExistsError, InvalidFeedURLError, ParseError
from flask import Flask, request, abort, Response, jsonify
from werkzeug.exceptions import HTTPException
import logging
import base64


# each thread must have a different reader because of SQLite3
reader = make_reader("db.sqlite")

app = Flask(__name__)

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
@app.route("/feeds", methods=["GET"])
def get_feeds():
	feeds = reader.get_feeds()
	return jsonify([feed_to_dict(feed) for feed in feeds])

@app.route("/feeds/<encoded_id>", methods=["GET"])
def get_feed(encoded_id):
	feed_id = decode_id(encoded_id)
	feed = reader.get_feed(feed_id)
	return feed_to_dict(feed)

@app.route("/feeds/<encoded_id>", methods=["PUT"])
def update_feed(encoded_id):
	feed_id = decode_id(encoded_id)
	reader.update_feed(feed_id)
	return Response(status=200)

@app.route("/feeds/<encoded_id>", methods=["POST"])
def add_feed(encoded_id):
	feed_id = decode_id(encoded_id)
	reader.add_feed(feed_id)
	reader.update_feed(feed_id)
	return Response(status=200)

@app.route("/feeds/<encoded_id>", methods=["DELETE"])
def delete_feed(encoded_id):
	feed_id = decode_id(encoded_id)
	reader.delete_feed(feed_id)
	return Response(status=200)
	
## Entry API
@app.route("/entries")
def get_entries():
	entries = reader.get_entries()
	return jsonify([entry_to_dict(entry) for entry in entries])


## Error handler
@app.errorhandler(Exception)
def handle_exception(e):
	if isinstance(e, FeedNotFoundError):
		return Response(status=404)
	elif isinstance(e, FeedExistsError):
		return Response(status=409)
	elif isinstance(e, InvalidFeedURLError):
		return Response(err.message, status=400)
	elif isinstance(e, ParseError):
		return Response(err.message, status=400)
	elif isinstance(e, HTTPException):
		return Response(status=e.code)
	else:
		logging.error(e)
		return Response(status=500)
	
