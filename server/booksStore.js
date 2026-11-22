const delay = () => new Promise((resolve) => setTimeout(resolve, 50));

let books = [
  {
    id: 1,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    genre: "fantasy",
    read: true,
    rating: 5,
  },
  {
    id: 2,
    title: "1984",
    author: "George Orwell",
    year: 1949,
    genre: "fiction",
    read: true,
    rating: 5,
  },
  {
    id: 3,
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    year: 1988,
    genre: "science",
    read: true,
    rating: 4,
  },
  {
    id: 4,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "history",
    read: true,
    rating: 4,
  },
  {
    id: 5,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    year: 1999,
    genre: "non-fiction",
    read: false,
    rating: null,
  },
  {
    id: 6,
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    year: 2007,
    genre: "fantasy",
    read: false,
    rating: null,
  },
  {
    id: 7,
    title: "Cosmos",
    author: "Carl Sagan",
    year: 1980,
    genre: "science",
    read: false,
    rating: null,
  },
  {
    id: 8,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    year: 1960,
    genre: "fiction",
    read: true,
    rating: 5,
  },
];

let nextId = 9;


export async function getAllBooks() {
    await delay();
    return [...books];
}

export async function getBookById(id) {
    await delay();
    return books.find((book) => book.id === id) ?? null;
}

export async function findDuplicate(title, author, excludeId = null) {
    await delay();
    const wantedTitle = title.trim().toLowerCase();
    const wantedAuthor = author.trim().toLowerCase();
    return (
        books.find(
            (book) => 
                book.id !== excludeId &&
            book.title.toLowerCase() === wantedTitle &&
            book.author.toLowerCase() === wantedAuthor
        ) ?? null
    );
}

export async function addBook(data) {
    await delay();
    const book = { ...data, id: nextId };
    nextId = nextId + 1;
    books = [...books,book];
    return book;
}

export async function replaceBook(id, data) {
    await delay();
    const existing = books.find((book) => book.id === id);
    if (!existing) {
        return null;
    }
    const updated = { ...data, id };
    books = books.map((book) => (book.id === id ? updated : book));
    return updated;
}

export async function removeBook(id) {
    await delay();
    const exists = books.some((book) => book.id === id);
    if (!exists) {
        return false;
    }
    books = books.filter((book) => book.id !== id);
    return true;
}