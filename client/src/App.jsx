import { useEffect, useState } from "react";
import {
  getBooks,
  getStats,
  createBook,
  replaceBook,
  updateBook,
} from "./api/books.js";
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
  const [editingBook, setEditingBook] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  function handleEdit(book) {
    setEditingBook(book);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleReplace(book) {
    const updated = await replaceBook(editingBook.id, book);
    setBooks((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
    setEditingBook(null);
    refreshStats();
  }

  async function changeBook(id, changes) {
    setBusyId(id);
    setActionError(null);
    try {
      const updated = await updateBook(id, changes);
      setBooks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      refreshStats();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  function handleToggleRead(book) {
    const changes = book.read ? { read: false, rating: null } : { read: true };
    changeBook(book.id, changes);
  }

  function handleRate(book, value) {
    changeBook(book.id, { rating: value === "" ? null : Number(value) });
  }

  return (
    <main className="app">
      <h1>Reading List</h1>
      <StatsPanel stats={stats} error={statsError} />
      {editingBook ? (
        <BookForm
          key={editingBook.id}
          initialBook={editingBook}
          onSubmit={handleReplace}
          onCancel={() => setEditingBook(null)}
        />
      ) : (
        <BookForm onSubmit={handleCreate} />
      )}
      <BookFilters filters={filters} onChange={handleFiltersChange} />
      {actionError && <p className="status error">{actionError}</p>}
      <BookList
        books={books}
        loading={loading}
        error={error}
        busyId={busyId}
        onEdit={handleEdit}
        onToggleRead={handleToggleRead}
        onRate={handleRate}
      />
    </main>
  );
}
