export default function StatsPanel({ stats, error }) {
  if (error) {
    return (
      <section className="panel">
        <p className="error">{error}</p>
      </section>
    );
  }
  if (!stats) {
    return (
      <section className="panel">
        <p>Loading statistics...</p>
      </section>
    );
  }
  return (
    <section className="panel">
      <h2>Statistics</h2>
      <p>
        Total: {stats.total} · Read: {stats.read} · Unread: {stats.unread} ·
        Average rating: {stats.averageRating ?? "no ratings yet"}
      </p>
      <p className="book-meta">
        {Object.entries(stats.byGenre)
          .map(([genre, count]) => `${genre}: ${count}`)
          .join(" · ")}
      </p>
    </section>
  );
}
