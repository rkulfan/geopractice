use actix_cors::Cors;
use actix_web::{get, web, App, HttpServer, Responder};
use rand::seq::IteratorRandom;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Player {
    native: String,
    latin: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Country {
    name: String,
    code: String,
}

#[get("/player/random")]
async fn get_random_player(data: web::Data<Vec<Player>>) -> impl Responder {
    let mut rng = rand::thread_rng();
    let player = data.choose(&mut rng).unwrap().clone();
    web::Json(player)
}

#[get("/flag/random")]
async fn get_random_flag(data: web::Data<HashMap<String, String>>) -> impl Responder {
    let mut rng = rand::thread_rng();

    if let Some((code, name)) = data.iter().choose(&mut rng) {
        let country = Country {
            code: code.clone(),
            name: name.clone(),
        };
        web::Json(country)
    } else {
        web::Json(Country {
            code: "xx".to_string(),
            name: "Unknown".to_string(),
        })
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load players
    let player_data = fs::read_to_string("./data/players.json")?;
    let players: Vec<Player> = serde_json::from_str(&player_data)?;
    let shared_players = web::Data::new(players);

    // Load countries
    let flag_data = fs::read_to_string("./data/countries.json")?;
    let country_map: HashMap<String, String> = serde_json::from_str(&flag_data)?;
    let shared_map = web::Data::new(country_map);

    println!("Starting Rust backend on port 3000");

    HttpServer::new(move || {
        App::new()
            .app_data(shared_players.clone())
            .app_data(shared_map.clone())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
                    .max_age(3600),
            )
            .service(get_random_player)
            .service(get_random_flag)
    })
    .bind(("0.0.0.0", 3000))?
    .run()
    .await
}
