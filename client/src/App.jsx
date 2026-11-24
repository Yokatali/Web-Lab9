import { useEffect, useState } from "react";
import { getBooks, getStats, createBook } from "./api/books.js";
import BookFilters from "./components/BookFilters.jsx";
import BookForm from "./components/BookForm.jsx";
import BookList from "./components/BookList.jsx";
import StatsPanel from "./components/StatsPanel.jsx";
import "./App.css";

const INITIAL_FILTERS = { q: "", genre: "", read: "", sort: "", order: "asc" };

export default function App() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);

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

  useEffect(() => {
    getStats()
      .then((data) => {
        setStats(data);
        setStatsError(null);
      })
      .catch((err) => setStatsError(err.message));
  }, [statsVersion]);

  function handleFiltersChange(nextFilters) {
    setFilters(nextFilters);
    setLoading(true);
  }

  function refreshStats() {
    setStatsVersion((version) => version + 1);
  }

  async function handleCreate(book) {
    const created = await createBook(book);
    setBooks((current) => [...current, created]);
    refreshStats();
  }

  return (
    <main className="app">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} error={statsError} />
      <BookForm onSubmit={handleCreate} />
      <BookFilters filters={filters} onChange={handleFiltersChange} />
      <BookList books={books} loading={loading} error={error} />
    </main>
  );
}
