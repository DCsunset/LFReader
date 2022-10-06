from fastapi.encoders import jsonable_encoder
import dataclasses
import base64
from reader import Entry

class DecodeError(Exception):
	"""An error occurred when decoding the id
	"""
	pass

def entry_encoder(entry: Entry, **kwargs):
	obj = dataclasses.asdict(entry)
	# Add feed_url manually because it's a getter
	obj["feed_url"] = entry.feed_url
	return jsonable_encoder(obj, **kwargs)
	

def encode_data(data, **kwargs):
	custom_encoder = {
		Entry: lambda e: entry_encoder(e, **kwargs)
	}
	return jsonable_encoder(data, custom_encoder=custom_encoder, **kwargs)
	
def decode_id(data: str):
	try:
		# add enough padding or it may raise an exception
		return base64.urlsafe_b64decode((data + "==").encode("utf-8")).decode("utf-8")
	except:
		raise DecodeError("Invalid ID")
