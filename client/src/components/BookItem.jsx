export default function BookItem({ book }) {
  return (
    <li className="book">
      <div className="book-info">
        <strong>{book.title}</strong>
        <span>
          {book.author}, {book.year}
        </span>
        <span className="book-meta">
          {book.genre} · {book.read ? "read" : "unread"} ·{" "}
          {book.rating === null ? "no rating" : `rating ${book.rating}/5`}
        </span>
      </div>
    </li>
  );
}
