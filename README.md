# Aether Reads — Book Review & Social Reading App

A full-stack MERN (MongoDB, Express, React, Node.js) web application for discovering books, logging reading diaries, publishing 5-star reviews, and connecting with fellow readers.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs
- **Database:** MongoDB & Mongoose
- **APIs:** Google Books API & Open Library API

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas URI)

---

## Installation & Setup

### 1. Clone & Navigate to Project
```bash
git clone <repository-url>
cd Book-Review-main
```

### 2. Backend Setup
```bash
# Navigate to server folder
cd server

# Install dependencies
npm install

# (Optional) Seed the database with sample books and users
npm run seed

# Start backend server
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
Open a new terminal window:
```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start frontend development server
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## Environment Variables (Optional)

Create a `.env` file in the `server` directory (or use default values):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/aether_reads
JWT_SECRET=super_secret_aether_jwt_key
NODE_ENV=development
```

---

## Key Features

- **Book Catalog:** Browse books, search by title/author, and filter by genre.
- **Add Custom Books:** Add new books manually directly to the catalog.
- **Reviews & Ratings:** Publish 1–5 star ratings, mood tags, spoiler tags, and review thoughts.
- **Comments & Replies:** Comment directly on reviews and reading diary entries.
- **Reading Diary:** Track read dates, re-reads, ratings, and private reading notes.
- **Social Reader Network:** Follow readers, search users by `@username`, view followed reader feeds, and pass book recommendation notes.
- **Adaptive Ambience:** Switch between Candlelit Study, Midnight Velvet, and Starlight Atrium atmospheres.

---

## Useful Scripts

| Directory | Command | Description |
|-----------|---------|-------------|
| `server/` | `npm run dev` | Runs backend with nodemon |
| `server/` | `npm start` | Runs backend in production mode |
| `server/` | `npm run seed` | Seeds MongoDB with initial books and users |
| `client/` | `npm run dev` | Starts Vite dev server |
| `client/` | `npm run build` | Builds client for production |

