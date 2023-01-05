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
 * Feed definition in the database
 */
#[derive(FromRow)]
struct Feed {
	id: String,
	title: Option<String>,
	authors: Vec<Person>,
	description: Option<String>,
	/// the URL of the feed website (different from URL of this feed)
	link: Link,
	updated: Option<DateTime<Utc>>,
	published: Option<DateTime<Utc>>,
	/// filename for the icon stored in this feed's dir
	icon: Option<String>,
	/// filename for the logo stored in this feed's dir
	logo: Option<String>
}

/**
 * Entry definition in the database
 */
#[derive(FromRow)]
struct Entry {
	id: String,
	title: Option<Text>,
	updated: Option<DateTime<Utc>>,
	authors: Vec<Person>,
	content: Option<Content>,
	summary: Option<Text>
}

pub async fn init_db(db: &Pool<Sqlite>) -> sqlx::Result<()> {
	let initStmt = r#"
		CREATE TABLE IF NOT EgISTS feeds(
			id TEXT PRIMARY KEY title TEXT,
			authors TEXT,  -- JSON string
			description TEXT,
			links TEXT,  -- JSON string
			updated TIMESTAMP,  -- ISO DateTime
			published TIMESTAMP,  -- ISO DateTime
			icon TEXT,  -- name in local filesystem
			logo TEXT  -- name in local filesystem
		);

		CREATE TABLE IF NOT EXISTS entries(
			-- Entry data
			id TEXT PRIMARY KEY,
			feed TEXT NOT NULL,
			title TEXT,
			authors TEXT,  -- JSON string
			summary TEXT, -- JSON string
			content TEXT, -- JSON string
			links TEXT,  -- JSON string
			updated TEXT,  -- ISO DateTime
			published TEXT,  -- ISO DateTime

			-- YAFR data
			status INTEGER NOT NULL DEFAULT 0,  -- Bitmap(read, starred)

			FOREIGN KEY(feed) REFERENCES feeds(id)
				ON UPDATE CASCADE
				ON DELETE CASCADE
			);
	"#;
	
	sqlx::query(initStmt).execute(db).await?;
	Ok(())
}
