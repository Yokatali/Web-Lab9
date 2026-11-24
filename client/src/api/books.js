const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = "GET", body, signal } = {}) {
  const options = { method, signal };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    const data = await response.json();
    throw new Error(
      data.error ?? `Request failed with status ${response.status}`,
    );
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export function getBooks(filters, signal) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return request(query ? `/api/books?${query}` : "/api/books", { signal });
}

export function getStats() {
  return request("/api/stats");
}

export function createBook(book) {
  return request("/api/books", { method: "POST", body: book });
}

export function replaceBook(id, book) {
  return request(`/api/books/${id}`, { method: "PUT", body: book });
}

export function updateBook(id, changes) {
  return request(`/api/books/${id}`, { method: "PATCH", body: changes });
}

export function deleteBook(id) {
  return request(`/api/books/${id}`, { method: "DELETE" });
}