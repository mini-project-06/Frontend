import { BASE_URL } from './config';

const URL = `${BASE_URL}/books`;

export const getBooks = () =>
  fetch(URL);

export const getBooksByCategory = (category) =>
  fetch(`${URL}?category=${category}`);

export const getBook = (id) =>
  fetch(`${URL}/${id}`);

export const createBook = (data) =>
  fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const updateBook = (id, data) =>
  fetch(`${URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteBook = (id) =>
  fetch(`${URL}/${id}`, { method: 'DELETE' });

export const updateBookCover = (id, coverImageUrl) =>
  fetch(`${URL}/${id}/cover`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coverImageUrl }),
  });

export const getRelatedBooks = (id) =>
  fetch(`${URL}/${id}/related`);

