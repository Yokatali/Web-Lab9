import { useEffect, useState } from "react";
import { getBooks } from "./api/books.js";
import BookFilters from "./components/BookFilters.jsx";
import BookList from "./components/BookList.jsx";
import "./App.css";

const INITIAL_FILTERS = { q: "", genre: "", read: "", sort: "", order: "asc" };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    getBooks(filters, controller.signal)
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
  }, [filters]);

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    setLoading(true);
  }

  return (
    <main className="app">
      <h1>Reading List</h1>
      <BookFilters filters={filters} onChange={handleFiltersChange} />
      <BookList books={books} loading={loading} error={error} />
    </main>
  );
}
