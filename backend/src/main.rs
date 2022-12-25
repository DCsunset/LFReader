mod feeds;
mod storage;
mod app_state;

use actix_web::{
	web,
	App,
	HttpServer,
	middleware
};

// Feeds
use crate::feeds::get_feeds;


#[actix_web::main]
async fn main() -> std::io::Result<()> {
	env_logger::init();
	let db_file = std::env::var("YAFR_DB").expect("YAFR_DB must be set");

	// opendb pool
	let db = storage::open_db(&format!("sqlite://{}", db_file))
		.await
		.expect("Error opening db");

	HttpServer::new(move || {
		let state = app_state::AppState {
			db: db.clone()
		};

		App::new()
			.app_data(web::Data::new(state))
			.wrap(middleware::Logger::default())
			// Trim trailing slashes
			.wrap(middleware::NormalizePath::trim())
			.service(
				web::scope("/feeds")
					.service(get_feeds)
			)
	})
		.bind(("0.0.0.0", 3000))?
		.run()
		.await
}
