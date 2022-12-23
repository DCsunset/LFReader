use actix_web::{get, HttpResponse};

#[get("")]
pub async fn get_feeds() -> HttpResponse {
	HttpResponse::Ok().body("Ok")
}

