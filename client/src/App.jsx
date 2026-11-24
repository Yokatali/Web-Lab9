import { useEffect, useState } from "react";
import { getBooks } from "./api/books.js";
import BookList from "./components/BookList.jsx";
import "./App.css";

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getBooks({}, controller.signal)
      .then((data) => {
        setBooks(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          return;
        }
        setError(err.message);
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="app">
      <h1>Reading List</h1>
      <BookList books={books} loading={loading} error={error} />
    </main>
  );
}
