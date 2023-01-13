use std::str::FromStr;
use crate::types::{Text, Content, Link, Person};
use serde::{Serialize, Deserialize};
use sqlx::{
	sqlite::{SqlitePoolOptions, SqliteConnectOptions, SqliteRow},
	Pool,
	Sqlite,
	Row, FromRow
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


pub type StatusType = u32;
/** Status Bitset */
#[derive(Serialize, Deserialize)]
pub struct Status(StatusType);

impl Status {
	pub const READ_BIT: StatusType = 1;
	pub const STARRED_BIT: StatusType = 1 << 1;

	pub fn get(&self, bit: StatusType) -> bool {
		self.0 & bit != 0
	}

	pub fn set(&mut self, bit: StatusType) {
		self.0 |= bit;
	}
}

/**
 * Entry definition
 */
#[derive(Serialize, Deserialize)]
pub struct Entry {
	id: String,
	title: Option<Text>,
	links: Vec<Link>,
	authors: Vec<Person>,
	content: Option<Content>,
	summary: Option<Text>,
	updated: Option<String>,
	published: Option<String>
}

/**
 * Feed definition
 */
#[derive(Serialize, Deserialize)]
pub struct Feed {
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
	updated: Option<String>,
	published: Option<String>,

	/* YAFR Data */
	/// Tags of this feed
	tags: Vec<String>,
	entries: Vec<Entry>,
	status: Status
}

fn sqlx_decode_error<E>(e: E) -> sqlx::Error
	where
		E: std::error::Error + 'static + Send + Sync {
	sqlx::Error::Decode(Box::new(e))
}

impl<'r> FromRow<'r, SqliteRow> for Feed {
	fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
		let id = row.try_get("id")?;

		Ok(Feed {
			id: id,
			title: row.try_get("title")?,
			authors: serde_json::from_str(row.try_get("authors")?).map_err(sqlx_decode_error)?,
			description: row.try_get("description")?,
			links: serde_json::from_str(row.try_get("links")?).map_err(sqlx_decode_error)?,
			/// filename for the icon stored in this feed's dir
			icon: row.try_get("icon")?,
			/// filename for the logo stored in this feed's dir
			logo: row.try_get("logo")?,
			updated: row.try_get("updated")?,
			published: row.try_get("published")?,
			// TODO: Fill up with other queries
			tags: Vec::new(),
			entries: Vec::new(),
			status: Status(row.try_get("status")?)
		})
	}
}

#[derive(Clone)]
pub struct Storage {
	pub db: Pool<Sqlite>
}

impl Storage {
	pub async fn init_db(&self) -> sqlx::Result<()> {
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
		
		sqlx::query(init_stmt).execute(&self.db).await?;
		Ok(())
	}

	pub async fn get_feeds(&self) -> sqlx::Result<Vec<Feed>> {
		let feeds = sqlx::query_as::<_, Feed>("SELECT * FROM feeds")
			.fetch_all(&self.db)
			.await?;

		// TODO: fetch entries
		
		Ok(feeds)
	}
}

