# GeoPractice ([link](http://geopractice.com.s3-website.us-east-2.amazonaws.com/))
Website for users to practice and study everything geography related.

## Existing Features
- Russian cyrillic transliteration of Russian ice hockey player names
- Country flag identification practice (typing + multiple choice)
  - \+ correct streaks

## Planned Features
- Country flag mode that goes through every flag in the category, rather than being random every time
- Country capital quizzes
- Further language identification and transliteration practice
- Other areas to practice:
  - Regional phone code
  - Names and locations of country subregions
  - Country outlines
  - Biggest cities globally/per country
  - ...and more

## Tech Stack
-   **Communication Protocol**:
    - **REST**
-   **Backend**:
    - Rust: **Actix-web**
-   **Frontend**:
    - JavaScript/TypeScript: **React.js** and **Vite**

## Hosting and Deployment
- Frontend is hosted on **AWS S3** as a static website
- Backend is hosted on an **AWS EC2** instance

## Running Locally

### Backend Setup (Rust)
1. From your main project directory, make sure Rust is installed. If not, install it from [rustup.rs](https://rustup.rs/)
2. Navigate to the backend directory with `cd ./backend`
3. Build and run the backend server with `cargo run`

### Frontend Setup
1. Return to the main project directory
2. Navigate to the frontend directory with `cd ./frontend`
3. Create a file inside of the frontend directory called .env
4. Within the .env file define a variable `VITE_API_IP=localhost` and save
5. Run `npm install` to install dependencies
6. Run the frontend using `npm run dev`
7. Open your browser to the URL shown in the terminal (usually http://localhost:5173)
