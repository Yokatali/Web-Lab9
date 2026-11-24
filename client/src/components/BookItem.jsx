export default function BookItem({
  book,
  busy,
  onEdit,
  onToggleRead,
  onRate,
}) {
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
      <div className="book-actions">
        <label>
          <input
            type="checkbox"
            checked={book.read}
            disabled={busy}
            onChange={() => onToggleRead(book)}
          />
          Read
        </label>
        <select
          value={book.rating ?? ""}
          disabled={busy}
          onChange={(event) => onRate(book, event.target.value)}
        >
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((rating) => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>
        <button type="button" disabled={busy} onClick={() => onEdit(book)}>
          Edit
        </button>
      </div>
    </li>
  );
}
