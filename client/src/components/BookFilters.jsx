import { GENRES } from "../genres.js";

export default function BookFilters({ filters, onChange }) {
  function handleChange(event) {
    onChange({ ...filters, [event.target.name]: event.target.value });
  }

  return (
    <div className="filters">
      <input
        type="search"
        name="q"
        placeholder="Search title or author"
        value={filters.q}
        onChange={handleChange}
      />
      <select name="genre" value={filters.genre} onChange={handleChange}>
        <option value="">All genres</option>
        {GENRES.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </select>
      <select name="read" value={filters.read} onChange={handleChange}>
        <option value="">Read and unread</option>
        <option value="true">Read</option>
        <option value="false">Unread</option>
      </select>
      <select name="sort" value={filters.sort} onChange={handleChange}>
        <option value="">Sort by id</option>
        <option value="title">Sort by title</option>
        <option value="author">Sort by author</option>
        <option value="year">Sort by year</option>
        <option value="rating">Sort by rating</option>
      </select>
      <select name="order" value={filters.order} onChange={handleChange}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
}
