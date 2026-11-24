import { useState } from "react";
import { GENRES } from "../genres.js";

const EMPTY_VALUES = {
  title: "",
  author: "",
  year: "",
  genre: "fiction",
  read: false,
  rating: "",
};

function toValues(book) {
  return {
    title: book.title,
    author: book.author,
    year: String(book.year),
    genre: book.genre,
    read: book.read,
    rating: book.rating === null ? "" : String(book.rating),
  };
}

export default function BookForm({ initialBook, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    initialBook ? toValues(initialBook) : EMPTY_VALUES,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues({ ...values, [name]: type === "checkbox" ? checked : value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        title: values.title,
        author: values.author,
        year: Number(values.year),
        genre: values.genre,
        read: values.read,
        rating: values.rating === "" ? null : Number(values.rating),
      });
      if (!initialBook) {
        setValues(EMPTY_VALUES);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>{initialBook ? "Edit book" : "Add a book"}</h2>
      <div className="book-form">
        <label>
          Title
          <input name="title" value={values.title} onChange={handleChange} />
        </label>
        <label>
          Author
          <input name="author" value={values.author} onChange={handleChange} />
        </label>
        <label>
          Year
          <input
            name="year"
            type="number"
            value={values.year}
            onChange={handleChange}
          />
        </label>
        <label>
          Genre
          <select name="genre" value={values.genre} onChange={handleChange}>
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Rating
          <select name="rating" value={values.rating} onChange={handleChange}>
            <option value="">No rating</option>
            {[1, 2, 3, 4, 5].map((rating) => (
              <option key={rating} value={rating}>
                {rating}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="read"
            checked={values.read}
            onChange={handleChange}
          />
          Read
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : initialBook ? "Save changes" : "Add book"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
