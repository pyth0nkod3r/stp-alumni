import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://api.blazingtorrent.org/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append auth token
api.interceptors.request.use(
  (config) => {
    // Use js-cookie to get the token, which is accessible both client-side
    // and can be synced with Next.js middleware.
    if (typeof window !== 'undefined') {
      const Cookies = require('js-cookie');
      const token = Cookies.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors like 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // We'll leave the redirect logic to the components or specific auth handling
      }
    }
    return Promise.reject(error);
  }
);

export default api;
