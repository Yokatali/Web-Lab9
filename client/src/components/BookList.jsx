import BookItem from "./BookItem.jsx";

export default function BookList({
  books,
  loading,
  error,
  busyId,
  onEdit,
  onToggleRead,
  onRate,
}) {
  if (loading) {
    return <p className="status">Loading books...</p>;
  }
  if (error) {
    return <p className="status error">{error}</p>;
  }
  if (books.length === 0) {
    return <p className="status">No books found.</p>;
  }
  return (
    <ul className="book-list">
      {books.map((book) => (
        <BookItem
          key={book.id}
          book={book}
          busy={busyId === book.id}
          onEdit={onEdit}
          onToggleRead={onToggleRead}
          onRate={onRate}
        />
      ))}
    </ul>
  );
}
