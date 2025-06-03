use serde::Serialize;
use actix_cors::Cors;
use actix_web::{get, web, App, HttpServer, Responder};

#[derive(Serialize)]
struct Player {
    native: String,
    latin: String
}

#[get("/player/{name}")]
async fn get_player(path: web::Path<String>) -> impl Responder {
    let name = path.into_inner().replace('_', " ");
    println!("{name}");
    // Dummy data
    let player = Player {
        native: String::from("Артемий Панарин"),
        latin: name
    };
    web::Json(player)
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
            .service(get_player)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}