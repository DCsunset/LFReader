use std::str::FromStr;

use sqlx::{sqlite::{SqlitePoolOptions, SqliteConnectOptions}, Pool, Sqlite};

pub async fn open_db(url: &str) -> sqlx::Result<Pool<Sqlite>> {
	SqlitePoolOptions::new()
		.max_connections(5)
		.connect_with(
			SqliteConnectOptions::from_str(url)?
				.create_if_missing(true)
		)
		.await
}
