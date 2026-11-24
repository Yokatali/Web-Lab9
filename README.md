# Reading List

A full-stack Reading List application. The server is a REST API built with Node.js and Express 5. The client is a React application built with Vite that talks to the API through a dedicated fetch module. Books are stored in memory on the server, so the data returns to its initial seed when the server restarts.

## Requirements

- Node.js current LTS (tested with Node 26)
- npm

## Installation and Running

The server and the client run as two separate processes, so use two terminals.

### Server

```bash
cd server
npm install
npm run dev
```

- `npm run dev` starts the server with `node --watch`, `npm start` starts it with plain `node`.
- The server listens on `http://localhost:3000` by default.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port the server listens on |
| `CLIENT_ORIGIN` | `http://localhost:5173` | The only origin allowed by CORS |

Example with custom values:

```bash
PORT=4000 CLIENT_ORIGIN=http://localhost:5173 npm run dev
```

### Client

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

- The client runs on `http://localhost:5173`.
- `.env` is not committed. `.env.example` documents the variable:

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the API |

No Vite proxy is configured. The browser calls the API directly and the server answers with CORS headers from the `cors` package.

## File Organization

```
assignment9/
├─ server/
│   ├─ server.js          Express app: middleware, routes, 404 fallback, error handler
│   ├─ booksStore.js      In-memory data with async functions and immutable updates
│   ├─ validate.js        Id parsing, book validation and list query validation
│   ├─ package.json
│   └─ package-lock.json
├─ client/
│   ├─ src/
│   │   ├─ api/books.js           All fetch calls and the shared request helper
│   │   ├─ components/
│   │   │   ├─ BookFilters.jsx    Search, genre, read, sort and order controls
│   │   │   ├─ BookForm.jsx       Form used for adding (POST) and editing (PUT)
│   │   │   ├─ BookItem.jsx       One book with read toggle, rating, edit and delete
│   │   │   ├─ BookList.jsx       Loading, error and empty states and the list
│   │   │   └─ StatsPanel.jsx     Statistics from GET /api/stats
│   │   ├─ genres.js              The list of valid genres
│   │   ├─ App.jsx                State and the handlers that call the API module
│   │   ├─ App.css
│   │   ├─ index.css
│   │   └─ main.jsx
│   ├─ .env.example
│   ├─ index.html
│   └─ package.json
├─ .gitignore
└─ README.md
```

## API

| Method and path | Success | Errors |
| --- | --- | --- |
| `GET /api/books` | `200` | `400` |
| `GET /api/books/:id` | `200` | `400`, `404` |
| `POST /api/books` | `201` with `Location` header | `400`, `409` |
| `PUT /api/books/:id` | `200` | `400`, `404`, `409` |
| `PATCH /api/books/:id` | `200` | `400`, `404`, `409` |
| `DELETE /api/books/:id` | `204` with no body | `400`, `404` |
| `GET /api/stats` | `200` | |

Query options for `GET /api/books`: `genre`, `read` (`true` or `false`), `q` (text in title or author), `sort` (`title`, `author`, `year`, `rating`), `order` (`asc` or `desc`), `limit` (1 to 50) and `page`. Any unknown path under `/api` answers `404` with `{ "error": "Not found" }`, and every error response has the shape `{ "error": "message" }`.
