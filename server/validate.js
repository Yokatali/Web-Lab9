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