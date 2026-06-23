import { BASE_URL } from './config';

const URL = `${BASE_URL}/reviews`;

export const getReviews = (bookId) =>
  fetch(`${URL}?bookId=${bookId}`);

export const createReview = (data) =>
  fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

export const deleteReview = (id, password) =>
  fetch(`${URL}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
