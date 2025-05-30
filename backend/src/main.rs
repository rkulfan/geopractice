use serde::Serialize;
use actix_cors::Cors;
use actix_web::{get, web, App, HttpServer, Responder};

#[derive(Serialize)]
struct Location {
    name: String,
    lat: f64,
    lon: f64,
}

#[get("/location/{name}")]
async fn get_location(path: web::Path<String>) -> impl Responder {
    let name = path.into_inner();
    // Dummy data
    let loc = Location {
        name: name.clone(),
        lat: 40.7128,
        lon: -74.0060,
    };
    web::Json(loc)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting Rust backend on http://localhost:8080");

    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()  // for testing allow all origins
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600),
            )
            .service(get_location)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}