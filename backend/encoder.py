from fastapi.encoders import jsonable_encoder
import dataclasses
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

def encode_id(id: str):
	return base64.encodebytes(data.encode("utf-8")).decode("utf-8")
	
def decode_id(data: str):
	try:
		return base64.decodebytes(data.encode("utf-8")).decode("utf-8")
	except:
		raise DecodeError("Invalid ID")
