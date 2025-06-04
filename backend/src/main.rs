use actix_cors::Cors;
use actix_web::{App, HttpServer, Responder, get, web};
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Player {
    native: String,
    latin: String,
}

#[get("/player/random")]
async fn get_random_player(data: web::Data<Vec<Player>>) -> impl Responder {
    let mut rng = rand::thread_rng();
    let player = data.choose(&mut rng).unwrap().clone();  // clone to return owned value
    web::Json(player)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = fs::read_to_string("./data/players.json")?;
    let players: Vec<Player> = serde_json::from_str(&data)?;
    let shared_players = web::Data::new(players);

    println!("Starting Rust backend on http://localhost:3000");

    HttpServer::new(move || {
        App::new()
            .app_data(shared_players.clone())
            .wrap(
                Cors::default()
                    .allow_any_origin() // for testing allow all origins
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600),
            )
            .service(get_random_player)
    })
    .bind(("127.0.0.1", 3000))?
    .run()
    .await
}
