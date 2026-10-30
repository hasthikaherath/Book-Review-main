// AETHER READS API CLIENT
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('aether_jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `API error (${response.status})`);
  }
  return data;
}

export const request = apiRequest;

// Health & Database Telemetry
export const api = {
  getHealth: () => apiRequest('/health'),
  getStats: () => apiRequest('/stats'),

  // Auth
  login: (emailOrUsername, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    }),

  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiRequest('/auth/me'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books${query ? `?${query}` : ''}`);
  },

  getBook: (id) => apiRequest(`/books/${id}`),

  createBook: (bookData) =>
    apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  updateBook: (id, data) =>
    request('/books/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBook: (id) =>
    request('/books/' + id, {
      method: 'DELETE',
    }),

  importBook: (bookData) =>
    apiRequest('/books/import', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  reactBook: (bookId, type) =>
    apiRequest(`/books/${bookId}/react`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  searchExternal: (q, provider = 'google') => {
    if (provider === 'google') {
      return apiRequest(`/books/google-books?q=${encodeURIComponent(q)}`);
    }
    return apiRequest(`/books/external-search?q=${encodeURIComponent(q)}`);
  },

  // Reviews
  getReviews: (bookId) => {
    if (bookId) return apiRequest(`/reviews/book/${bookId}`);
    return apiRequest('/reviews');
  },

  createReview: (payload) =>
    apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateReview: (id, data) =>
    request('/reviews/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteReview: (id) =>
    request('/reviews/' + id, {
      method: 'DELETE',
    }),

  reactReview: (reviewId) =>
    apiRequest(`/reviews/${reviewId}/react`, {
      method: 'POST',
    }),

  // Reading Diary
  getDiary: (username) => {
    if (username) return apiRequest(`/diary/user/${username}`);
    return apiRequest('/diary');
  },

  createDiaryEntry: (payload) =>
    apiRequest('/diary', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateDiaryEntry: (id, data) =>
    request('/diary/' + id, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDiaryEntry: (id) =>
    request('/diary/' + id, {
      method: 'DELETE',
    }),

  // Users & Social
  getUsers: () => apiRequest('/users'),

  getUser: (identifier) => apiRequest(`/users/${identifier}`),

  updateProfile: (data) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  followUser: (userId) =>
    apiRequest(`/users/${userId}/follow`, {
      method: 'POST',
    }),

  getFollowingFeed: () => apiRequest('/users/feed/following'),
};
