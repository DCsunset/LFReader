from fastapi.encoders import jsonable_encoder
import dataclasses
import base64
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
	return jsonable_encoder(entries, exclude={"feed"}, exclude_none=True)
		
def decode_id(data: str):
	try:
		# add enough padding or it may raise an exception
		return base64.urlsafe_b64decode((data + "==").encode("utf-8")).decode("utf-8")
	except:
		raise DecodeError("Invalid ID")
