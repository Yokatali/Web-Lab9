import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  findDuplicate,
  addBook,
  replaceBook,
  removeBook,
} from "./booksStore.js";
import { parseId, validateBook, parseListQuery } from "./validate.js";

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

function compareBooks(a, b, sort, order) {
  if (sort === "rating") {
    if (a.rating === null && b.rating === null) {
      return 0;
    }

    if (a.rating === null) {
      return 1;
    }

    if (b.rating === null) {
      return -1;
    }
  }

  const difference =
    sort === "title" || sort === "author"
      ? a[sort].localeCompare(b[sort])
      : a[sort] - b[sort];
  return order === "asc" ? difference : -difference;
}

app.get("/api/books", async (req, res) => {
  const result = parseListQuery(req.query);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  const { genre, read, q, sort, order, limit, page } = result.value;
  const books = await getAllBooks();
  const filtered = books.filter(
    (book) =>
      (genre === null || book.genre === genre) &&
      (read === null || book.read === read) &&
      (q === null ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q)),
  );
  const sorted = [...filtered].sort((a, b) => compareBooks(a, b, sort, order));
  const start = (page - 1) * limit;
  res.status(200).json(sorted.slice(start, start + limit));
});

app.get("/api/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const book = await getBookById(id);
  if (!book) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  res.status(200).json(book);
});

app.get("/api/stats", async (req, res) => {
  const books = await getAllBooks();
  const readBooks = books.filter((book) => book.read);
  const rated = books.filter((book) => book.rating !== null);
  const averageRating =
    rated.length === 0
      ? null
      : Math.round(
          (rated.reduce((sum, book) => sum + book.rating, 0) / rated.length) *
            10,
        ) / 10;
  const byGenre = books.reduce(
    (counts, book) => ({
      ...counts,
      [book.genre]: (counts[book.genre] ?? 0) + 1,
    }),
    {},
  );
  res.status(200).json({
    total: books.length,
    read: readBooks.length,
    unread: books.length - readBooks.length,
    averageRating,
    byGenre,
  });
});

app.put("/api/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const result = validateBook(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  const duplicate = await findDuplicate(
    result.value.title,
    result.value.author,
    id,
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "A book with this title and author already exists" });
  }
  const book = await replaceBook(id, result.value);
  res.status(200).json(book);
});

app.patch("/api/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const existing = await getBookById(id);
  if (!existing) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Array.isArray(req.body)
  ) {
    return res
      .status(400)
      .json({ error: "Request body must be a JSON object" });
  }
  const result = validateBook({ ...existing, ...req.body });
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  const duplicate = await findDuplicate(
    result.value.title,
    result.value.author,
    id,
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "A book with this title and author already exists" });
  }
  const book = await replaceBook(id, result.value);
  res.status(200).json(book);
});

app.post("/api/books", async (req, res) => {
  const result = validateBook(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }
  const duplicate = await findDuplicate(
    result.value.title,
    result.value.author,
  );
  if (duplicate) {
    return res
      .status(409)
      .json({ error: "A book with this title and author already exists" });
  }
  const book = await addBook(result.value);
  res.status(201).location(`/api/books/${book.id}`).json(book);
});

app.delete("/api/books/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  const removed = await removeBook(id);
  if (!removed) {
    return res.status(404).json({ error: `Book with id ${id} not found` });
  }
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
