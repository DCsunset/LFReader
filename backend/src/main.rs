mod feeds;

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

	HttpServer::new(|| {
		App::new()
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
