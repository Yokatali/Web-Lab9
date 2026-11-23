export const GENRES = [
  "fiction",
  "non-fiction",
  "science",
  "history",
  "fantasy",
  "other",
];

export function parseId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function checkText(value, name) {
  if (typeof value !== "string") {
    return `${name} must be a string`;
  }
  const length = value.trim().length;
  if (length < 1 || length > 100) {
    return `${name} must be between 1 and 100 characters after trimming`;
  }
  return null;
}

export function validateBook(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { error: "Request body must be a JSON object" };
  }

  const read = input.read === undefined ? false : input.read;
  const rating = input.rating === undefined ? null : input.rating;

  const titleError = checkText(input.title, "title");
  if (titleError) {
    return { error: titleError };
  }

  const authorError = checkText(input.author, "author");
  if (authorError) {
    return { error: authorError };
  }

  const currentYear = new Date().getFullYear();
  if (
    !Number.isInteger(input.year) ||
    input.year < 1000 ||
    input.year > currentYear
  ) {
    return { error: `year must be an integer between 1000 and ${currentYear}` };
  }

  if (!GENRES.includes(input.genre)) {
    return { error: `genre must be one of: ${GENRES.join(", ")}` };
  }

  if (typeof read !== "boolean") {
    return { error: "read must be true or false" };
  }

  if (rating !== null) {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: "rating must be an integer from 1 to 5, or null" };
    }
    if (!read) {
      return { error: "rating is allowed only when read is true" };
    }
  }

  return {
    value: {
      title: input.title.trim(),
      author: input.author.trim(),
      year: input.year,
      genre: input.genre,
      read,
      rating,
    },
  };
}

const SORT_FIELDS = ["title", "author", "year", "rating"];

export function parseListQuery(query) {
  const keys = ["genre", "read", "q", "sort", "order", "limit", "page"];
  for (const key of keys) {
    if (Array.isArray(query[key])) {
      return { error: `${key} must not be repeated` };
    }
  }

  const options = {
    genre: null,
    read: null,
    q: null,
    sort: "id",
    order: "asc",
    limit: 50,
    page: 1,
  };

  if (query.genre !== undefined) {
    if (!GENRES.includes(query.genre)) {
      return { error: `genre must be one of: ${GENRES.join(", ")}` };
    }
    options.genre = query.genre;
  }

  if (query.read !== undefined) {
    if (query.read !== "true" && query.read !== "false") {
      return { error: "read must be true or false" };
    }
    options.read = query.read === "true";
  }

  if (query.q !== undefined) {
    options.q = query.q.trim().toLowerCase();
  }

  if (query.sort !== undefined) {
    if (!SORT_FIELDS.includes(query.sort)) {
      return { error: `sort must be one of: ${SORT_FIELDS.join(", ")}` };
    }
    options.sort = query.sort;
  }

  if (query.order !== undefined) {
    if (query.order !== "asc" && query.order !== "desc") {
      return { error: "order must be asc or desc" };
    }
    options.order = query.order;
  }

  if (query.limit !== undefined) {
    const limit = parseId(query.limit);
    if (limit === null || limit > 50) {
      return { error: "limit must be an integer from 1 to 50" };
    }
    options.limit = limit;
  }

  if (query.page !== undefined) {
    const page = parseId(query.page);
    if (page === null) {
      return { error: "page must be a positive integer" };
    }
    options.page = page;
  }

  return { value: options };
}