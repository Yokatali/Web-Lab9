import express from "express";
import cors from "cors";
import {
  getAllBooks,
  getBookById,
  findDuplicate,
  addBook,
  replaceBook,
} from "./booksStore.js";
import { parseId, validateBook } from "./validate.js";

const PORT = process.env.PORT || 3000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/books", async (req, res) => {
  const books = await getAllBooks();
  res.status(200).json(books);
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
