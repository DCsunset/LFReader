from fastapi.encoders import jsonable_encoder
import dataclasses
from reader import Entry, Feed

class DecodeError(Exception):
	"""An error occurred when decoding the id
	"""
pass

"""
Encode one or a list of feeds
"""
def encode_feed(data):
	return jsonable_encoder(data, exclude_none=True)

"""
Encode one or a list of entries
"""
def encode_entry(data):
	return jsonable_encoder(data, exclude={"feed"}, exclude_none=True)
		