use actix_cors::Cors;
use actix_web::{get, web, App, HttpServer, Responder};
use rand::seq::IteratorRandom;
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;

type FlagMap = HashMap<String, HashMap<String, Vec<String>>>;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Player {
    native: String,
    latin: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Country {
    code: String,
    name: Vec<String>,
}

#[derive(Deserialize)]
struct QueryParams {
    category: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
enum NameList {
    Single(String),
    Multiple(Vec<String>),
}

impl NameList {
    fn into_vec(self) -> Vec<String> {
        match self {
            NameList::Single(s) => vec![s],
            NameList::Multiple(v) => v,
        }
    }
}

#[get("/player/random")]
async fn get_random_player(data: web::Data<Vec<Player>>) -> impl Responder {
    let mut rng = rand::thread_rng();
    let player = data.choose(&mut rng).unwrap().clone();
    web::Json(player)
}

#[get("/flag/random")]
async fn get_random_flag(
    data: web::Data<FlagMap>,
    query: web::Query<QueryParams>,
) -> impl Responder {
    let mut rng = rand::thread_rng();
    let selected_category = query
        .category
        .as_deref()
        .filter(|s| !s.is_empty())
        .unwrap_or("countries");

    if selected_category == "all" {
        let all_entries = data.values().flat_map(|map| map.iter()).collect::<Vec<_>>();

        if let Some((code, name_list)) = all_entries.choose(&mut rng) {
            return web::Json(Country {
                code: code.to_string(),
                name: name_list.to_vec(),
            });
        }
    } else if let Some(map) = data.get(selected_category) {
        if let Some((code, name_list)) = map.iter().choose(&mut rng) {
            return web::Json(Country {
                code: code.to_string(),
                name: name_list.clone(),
            });
        }
    }

    web::Json(Country {
        code: "xx".to_string(),
        name: ["Unknown".to_string()].to_vec(),
    })
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load players
    let player_data = fs::read_to_string("./data/players.json")?;
    let players: Vec<Player> = serde_json::from_str(&player_data)?;
    let shared_players = web::Data::new(players);

    // Load flags
    let flag_data = fs::read_to_string("./data/flags.json")?;
    let raw_map: HashMap<String, HashMap<String, NameList>> = serde_json::from_str(&flag_data)?;
    let flag_map: FlagMap = raw_map
        .into_iter()
        .map(|(cat, entries)| {
            let normalized = entries
                .into_iter()
                .map(|(code, name_list)| (code, name_list.into_vec()))
                .collect();
            (cat, normalized)
        })
        .collect();
    let shared_map = web::Data::new(flag_map);

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