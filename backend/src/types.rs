use serde::{Serialize, Deserialize};
use serde_with::{serde_as, DisplayFromStr};

// For ser/de types

#[serde_as]
#[derive(Serialize, Deserialize)]
pub struct Text {
	#[serde_as(as = "DisplayFromStr")]
	pub content_type: mime::Mime,
	pub src: Option<String>,
	pub content: String
}

impl From<Text> for feed_rs::model::Text {
	fn from(value: Text) -> Self {
		Self {
			content_type: value.content_type,
			src: value.src,
			content: value.content
		}		
	}
}

#[derive(Serialize, Deserialize)]
pub struct Link {
	pub href: String,
	pub rel: Option<String>,
	pub media_type: Option<String>,
	pub href_lang: Option<String>,
	pub title: Option<String>,
	pub length: Option<u64>
}

impl From<Link> for feed_rs::model::Link {
	fn from(value: Link) -> Self {
		Self {
			href: value.href,
			rel: value.rel,
			media_type: value.media_type,
			href_lang: value.href_lang,
			title: value.title,
			length: value.length
		}
	}
}


#[serde_as]
#[derive(Serialize, Deserialize)]
pub struct Content {
	pub body: Option<String>,
	#[serde_as(as = "DisplayFromStr")]
	pub content_type: mime::Mime,
	pub length: Option<u64>,
	pub src: Option<Link>,
}

impl From<Content> for feed_rs::model::Content {
	fn from(value: Content) -> Self {
		Self {
			body: value.body,
			content_type: value.content_type,
			length: value.length,
			src: value.src.map(Link::into)
		}
	}
}

#[derive(Serialize, Deserialize)]
pub struct Person {
	pub name: String,
	pub uri: Option<String>,
	pub email: Option<String>,
}

impl From<Person> for feed_rs::model::Person {
	fn from(value: Person) -> Self {
		Self {
			name: value.name,
			uri: value.uri,
			email: value.email
		}
	}
}
