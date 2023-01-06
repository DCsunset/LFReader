use std::str::FromStr;
use chrono::{DateTime, Utc};
use feed_rs::model::{Link, Text, Person, Content};
use sqlx::{
	sqlite::{SqlitePoolOptions, SqliteConnectOptions},
	Pool,
	Sqlite,
	FromRow
};

pub async fn open_db(url: &str) -> sqlx::Result<Pool<Sqlite>> {
	SqlitePoolOptions::new()
		.max_connections(5)
		.connect_with(
			SqliteConnectOptions::from_str(url)?
				.create_if_missing(true)
		)
		.await
}

/**
 * Entry definition
 */
struct Entry {
	id: String,
	title: Option<Text>,
	links: Vec<Link>,
	authors: Vec<Person>,
	content: Option<Content>,
	summary: Option<Text>,
	updated: Option<DateTime<Utc>>,
	published: Option<DateTime<Utc>>
}


pub type StatusType = u32;
/** Status Bitset */
pub struct Status {
	value: StatusType
}

impl Status {
	pub const READ_BIT: StatusType = 1;
	pub const STARRED_BIT: StatusType = 1 << 1;

	pub fn get(&self, bit: StatusType) -> bool {
		self.value & bit != 0
	}

	pub fn set(&mut self, bit: StatusType) {
		self.value |= bit;
	}
}
/**
 * Feed definition
 */
struct Feed {
	id: String,
	title: Option<String>,
	authors: Vec<Person>,
	description: Option<String>,
	/// the URL of the feed website (different from URL of this feed)
	links: Vec<Link>,
	/// filename for the icon stored in this feed's dir
	icon: Option<String>,
	/// filename for the logo stored in this feed's dir
	logo: Option<String>,
	updated: Option<DateTime<Utc>>,
	published: Option<DateTime<Utc>>,

	/* YAFR Data */
	/// Tags of this feed
	tags: Vec<String>,
	entries: Vec<Entry>,
	status: Status
}

pub async fn init_db(db: &Pool<Sqlite>) -> sqlx::Result<()> {
	let init_stmt = r#"
		-- Feeds
		CREATE TABLE IF NOT EgISTS feeds(
			id TEXT PRIMARY KEY title TEXT,
			authors TEXT,  -- JSON string
			description TEXT,
			links TEXT,  -- JSON string
			icon TEXT,  -- name in local filesystem
			logo TEXT,  -- name in local filesystem
			updated TEXT,  -- ISO DateTime
			published TEXT  -- ISO DateTime
		);

		-- Entries
		CREATE TABLE IF NOT EXISTS entries(
			-- Entry data
			id TEXT NOT NULL,
			feed TEXT NOT NULL,
			title TEXT,
			authors TEXT,  -- JSON string
			summary TEXT, -- JSON string
			content TEXT, -- JSON string
			links TEXT,  -- JSON string
			updated TEXT,  -- ISO DateTime
			published TEXT,  -- ISO DateTime

			-- YAFR data
			status INTEGER NOT NULL DEFAULT 0,  -- Status bitset

			PRIMARY KEY(id, feed),
			FOREIGN KEY(feed) REFERENCES feeds(id)
				ON UPDATE CASCADE
				ON DELETE CASCADE
		);
		
		-- Feed Tags
		CREATE TABLE IF NOT EXISTS feed_tags(
			name TEXT NOT NULL,
			feed TEXT NOT NULL,

			PRIMARY KEY(name, feed),
			FOREIGN KEY(feed) REFERENCES feeds(id)
				ON UPDATE CASCADE
				ON DELETE CASCADE
		);

		-- Index
		CREATE INDEX IF NOT EXISTS entries_by_feed on entries(feed);
		CREATE INDEX IF NOT EXISTS tags_by_feed on feed_tags(feed);
		CREATE INDEX IF NOT EXISTS tags_by_name on feed_tags(name);
	"#;
	
	sqlx::query(init_stmt).execute(db).await?;
	Ok(())
}
