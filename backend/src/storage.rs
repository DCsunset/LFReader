use std::str::FromStr;
use chrono::{DateTime, Utc};
use feed_rs::model::Link;
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
	authors: Vec<feed_rs::model::Person>,
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

pub async fn init_db(db: &Pool<Sqlite>) -> sqlx::Result<()> {
	let createStmt = r#"
		CREATE TABLE IF NOT EXISTS feeds {
			id TEXT PRIMARY KEY
			title TEXT
			-- JSON string
			authors TEXT
			description TEXT
			link TEXT
			updated TIMESTAMP
			published TIMESTAMP
			icon TEXT
			logo TEXT
		}
	"#;

	sqlx::query(createStmt)
		.execute(db)
		.await?;

	Ok(())
}
