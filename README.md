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

## Testing Evidence

All requests below were made in one run against a freshly started server, in this order, so each response reflects the changes made by the requests before it.

### 1. `GET /api/stats` before any change (200)

```
$ curl --include http://localhost:3000/api/stats

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-uWfsCM/iYvZmOkm98E7WDVClFJo"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":8,"read":5,"unread":3,"averageRating":4.6,"byGenre":{"fantasy":2,"fiction":2,"science":2,"history":1,"non-fiction":1}}
```

### 2. `200` list with two query parameters combined (`genre` and `read`)

```
$ curl --include "http://localhost:3000/api/books?genre=fantasy&read=true"

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 110
ETag: W/"6e-vY7St1Dhihiomnltqcw2GG6WXKo"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}]
```

### 3. `200` for one book

```
$ curl --include http://localhost:3000/api/books/1

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 108
ETag: W/"6c-wksYbf6e3ZJvQpjSjKuybvZ7BPQ"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":5}
```

### 4. `201` for a new book, with the `Location` header

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction"}'

HTTP/1.1 201 Created
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Location: /api/books/9
Content-Type: application/json; charset=utf-8
Content-Length: 105
ETag: W/"69-+XWwWjBWr657gEkCQAq0TrSqOB8"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"Dune","author":"Frank Herbert","year":1965,"genre":"fiction","read":false,"rating":null,"id":9}
```

### 5. `400` for an invalid body

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"","author":"X","year":3000,"genre":"poetry"}'

HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 69
ETag: W/"45-qQ4QmtIze0yCYsFEhiudiA8ZGwM"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"title must be between 1 and 100 characters after trimming"}
```

### 6. `400` for a repeated query parameter

```
$ curl --include "http://localhost:3000/api/books?genre=fiction&genre=history"

HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 38
ETag: W/"26-lxepMkDRVvPlaLI1MymRjo2aMRU"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"genre must not be repeated"}
```

### 7. `404` for a missing book

```
$ curl --include http://localhost:3000/api/books/99

HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 37
ETag: W/"25-RTk1gNJbCDq7JJxSLpp0pWjsLA0"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 99 not found"}
```

### 8. `409` for a duplicate (title and author compared case-insensitively)

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title":"dune","author":"FRANK HERBERT","year":1965,"genre":"fiction"}'

HTTP/1.1 409 Conflict
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 60
ETag: W/"3c-YJy0XpDp5agPe/8cl8QkvyagI8A"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"A book with this title and author already exists"}
```

### 9. `PATCH` and `PUT` on the same book

`PATCH` with only `rating` changes that one field and keeps everything else:

```
$ curl --include -X PATCH http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"rating":3}'

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 108
ETag: W/"6c-BLhkzlUL+/9d4vGMbv9EvmznDS4"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":true,"rating":3,"id":1}
```

`PUT` with a body that has no `read` and no `rating` replaces the whole book, so those fields go back to their defaults (`false` and `null`):

```
$ curl --include -X PUT http://localhost:3000/api/books/1 -H "Content-Type: application/json" -d '{"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy"}'

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 112
ETag: W/"70-L4dDcuYlKRgZrWQzWBxr3kHsF9Y"
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"title":"The Hobbit","author":"J.R.R. Tolkien","year":1937,"genre":"fantasy","read":false,"rating":null,"id":1}
```

### 10. `204` for a delete, followed by `404` for the same delete repeated

```
$ curl --include -X DELETE http://localhost:3000/api/books/3

HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Date: Tue, 24 Nov 2026 19:45:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

```
$ curl --include -X DELETE http://localhost:3000/api/books/3

HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 36
ETag: W/"24-b1CIVus4mTfq8V58s1hQKa1y69M"
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Book with id 3 not found"}
```

### 11. `GET /api/stats` after the changes

Compared with request 1: Dune was added, book 3 was deleted and book 1 became unread through `PUT`, so `read`, `unread`, `averageRating` and `byGenre` changed. The values are computed from the current data on every request.

```
$ curl --include http://localhost:3000/api/stats

HTTP/1.1 200 OK
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 127
ETag: W/"7f-9UUPIP8/5XMyhhx4Z/N+7EITuTM"
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"total":8,"read":3,"unread":5,"averageRating":4.7,"byGenre":{"fantasy":2,"fiction":3,"history":1,"non-fiction":1,"science":1}}
```

### 12. `404` fallback for an unknown path under `/api`

```
$ curl --include http://localhost:3000/api/nothing

HTTP/1.1 404 Not Found
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 13. `400` for malformed JSON

```
$ curl --include -X POST http://localhost:3000/api/books -H "Content-Type: application/json" -d '{"title": '

HTTP/1.1 400 Bad Request
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 48
ETag: W/"30-aN4vOcZSAqz3S4T1znDK+th71A4"
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Request body contains malformed JSON"}
```

### 14. `500` from a deliberate throw inside an async handler

To prove the error middleware works, a temporary route `GET /api/crash` awaited the store and then threw an error. Express 5 passed the rejected promise to the error-handling middleware, which logged the error on the server and answered with a JSON `500` without a stack trace. The route was removed in the commit "Remove deliberate crash route".

```
$ curl --include http://localhost:3000/api/crash

HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin
Content-Type: application/json; charset=utf-8
Content-Length: 32
ETag: W/"20-cI8B1wZuBEyTE5ClDvphKZx7wd0"
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Something went wrong"}
```

## Preflight Evidence

In Chrome DevTools (Network tab), clicking the **Read** checkbox of a book sends `PATCH /api/books/1` with a JSON body. Because `PATCH` is not a simple method and the request has a `Content-Type: application/json` header, the browser first sends a preflight request:

- **Request:** `OPTIONS http://localhost:3000/api/books/1`, type `preflight`, with the request headers `Origin: http://localhost:5173`, `Access-Control-Request-Method: PATCH` and `Access-Control-Request-Headers: content-type`.
- **Response:** `204 No Content` with these headers:
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE`
  - `Access-Control-Allow-Headers: content-type`
  - `Vary: Origin, Access-Control-Request-Headers`
  - `Content-Length: 0`
- Only after this preflight succeeded did the browser send the real `PATCH` request, which answered `200`, followed by `GET /api/stats` (`200`) to refresh the statistics panel.

The same preflight can be reproduced with `curl`:

```
$ curl --include -X OPTIONS http://localhost:3000/api/books/1 -H 'Origin: http://localhost:5173' -H 'Access-Control-Request-Method: PATCH' -H 'Access-Control-Request-Headers: content-type'

HTTP/1.1 204 No Content
X-Powered-By: Express
Access-Control-Allow-Origin: http://localhost:5173
Vary: Origin, Access-Control-Request-Headers
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
Content-Length: 0
Date: Tue, 24 Nov 2026 19:45:22 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

## Reasoning Questions

### 1. Parameters

The `id` identifies one specific resource, so it belongs in the path: `/api/books/3` is the address of book 3, and a missing book there is a clear `404`. `genre` and `sort` do not identify a resource; they only change how the same collection `/api/books` is filtered or ordered, which is what query parameters are for. If `id` were in the query string (`/api/books?id=3`), the URL would look like a filtered list instead of one book, a missing book would more naturally return an empty list instead of a `404`, and `PUT`, `PATCH` and `DELETE` would act on a list URL, which does not follow REST conventions.

### 2. Body parsing

I moved `app.use(express.json())` below all the routes and sent the same valid `POST` that normally returns `201`. Inside the route `req.body` was `undefined`, because the JSON body is only parsed when the request passes through `express.json()`, and the route had already answered before reaching it. My validation treated the missing body as invalid and the server returned `400` with `{"error":"Request body must be a JSON object"}`.

### 3. One response

I removed the `return` before the `404` response in `GET /api/books/:id` and requested `/api/books/99`. The client still received the `404`, but the function kept running, reached `res.status(200).json(book)` and tried to send a second response. The server logged `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`, and the error middleware then failed in the same way when it tried to send a `500`. A response can only be sent once, so `return` is needed to stop the handler.

### 4. PUT and PATCH

`PATCH` is the better choice when the user changes one thing, such as ticking the read checkbox or choosing a rating in my list: the client sends only `{ "rating": 4 }` and the other fields stay as they are. `PUT` is the better choice in the edit form, where the user sees all fields and saves the whole book: the client sends the complete book and the server replaces it. My evidence above shows the difference: `PATCH` with only `rating` kept `read: true`, while `PUT` without `read` and `rating` reset them to `false` and `null`.

### 5. CORS

I restarted the server with `CLIENT_ORIGIN=http://localhost:4000 npm run dev` and reloaded the client on `http://localhost:5173`. The page showed "Failed to fetch", the Network tab marked the `books` and `stats` requests as "CORS error", and the console said the request was blocked by CORS policy because the `Access-Control-Allow-Origin` header did not match the page's origin. The server printed nothing, because it only logs errors, but the `GET` requests still reached it and it answered them; the browser received the response and refused to give it to my JavaScript. `curl` still works because CORS is a rule that browsers enforce to protect users, not a server-side block, and `curl` does not check the `Access-Control-Allow-Origin` header at all.

### 6. Validation

Client checks only help the user; anyone can call the API without my form, for example with `curl`, Postman or another script, and send any body they want. The server is the only place that can protect the stored data, so it must validate every request itself. In my client I intentionally show the server's message, for example the `409` duplicate error or `year must be an integer between 1000 and 2026`, instead of relying on form checks.

### 7. State

After restarting the server, every book I had added, edited or deleted was gone and the list was back to the eight seed books. The data lives only in a JavaScript array in the server process's memory, so it disappears when the process stops. To keep it, the data must be saved outside the process, for example in a file or, better, in a database.

## Self-Study Notes

- **`URLSearchParams`**: In `client/src/api/books.js`, `getBooks` adds only the filters that have a value with `params.set(key, value)` and then uses `params.toString()`. It encodes special characters automatically, so a search such as `a&b c` cannot break the query string or add an extra parameter.
- **`localeCompare`**: When sorting by `title` or `author`, the server compares strings with `a[sort].localeCompare(b[sort])`, which returns a negative number, zero or a positive number like `sort` expects and compares text alphabetically instead of by character codes. Numbers (`year`, `rating`) are compared with subtraction, and books without a rating are returned last before the direction is applied, so they stay last in both orders. The server sorts a copy (`[...filtered].sort(...)`) so the stored array never changes.
- **`import.meta.env` and the `VITE_` prefix**: Vite exposes environment variables to client code through `import.meta.env`, but only variables whose names start with `VITE_`. This prevents secrets in `.env` from being bundled into the browser code by accident. The client reads `import.meta.env.VITE_API_URL`, the value is set in `client/.env`, and `client/.env.example` documents it.
- **Empty `204` response in Express 5**: `DELETE` answers with `res.status(204).end()`. A `204` must not have a body, so `.end()` finishes the response without one, and the client helper checks for `204` and does not call `response.json()`.
- **Cancelling `fetch` and `AbortError`**: The list effect in `App.jsx` creates an `AbortController`, passes its `signal` to `fetch` and calls `controller.abort()` in the cleanup function. When the filters change before the old request finishes, the old `fetch` rejects with an error whose `name` is `"AbortError"`; the client ignores that error, so an old response never overwrites a newer one.
- **Errors in async handlers in Express 5**: Express 5 forwards a rejected promise from an `async` route handler to the error-handling middleware, so no `try`/`catch` is needed in every route. A middleware with four parameters `(err, req, res, next)` is treated as an error handler. Malformed JSON from `express.json()` arrives there with `err.type === "entity.parse.failed"`, which I turn into a `400`.

## Challenges

- **Running commands in the wrong folder.** I ran `npm run dev` and test commands from `assignment9` instead of `server`, which gave `ENOENT` and module-not-found errors. I learned to check which folder has the `package.json` before running scripts.
- **Typos that only appeared at runtime.** Small mistakes such as a misspelled function name or `update` vs `updated` only failed when that code path ran, and the first failures came back as Express's HTML error page. Testing every route with `curl --include` after each change, and later adding the JSON error middleware, made these problems visible quickly.
- **Keeping commits small and meaningful.** Once a single-book `GET` route and an unfinished stats route ended up in the same commit. Because it was not pushed yet, I undid it with `git reset --soft HEAD~1`, removed the unfinished code and committed the two changes separately.
- **`PATCH` validation.** Validating only the fields that were sent was not enough, because a change such as `read: false` can make an existing rating invalid. Merging the existing book with the changes and validating the merged book with the same function as `POST` and `PUT` solved this, and the client sends `rating: null` together with `read: false` when a rated book is marked unread.
- **Stale list responses.** Typing quickly in the search box sends several requests. Cancelling the previous request with `AbortController` makes sure only the latest response updates the list.
