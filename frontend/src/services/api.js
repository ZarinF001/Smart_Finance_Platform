import axios from 'axios';

// Base API URL from environment variable (safely fallback if running in Node test environment)
const API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000/api';

/**
 * Centralized Axios client instance configured for HTTP-only cookie authentication
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (HTTP-only JWT) are sent with every cross-origin request
  withCredentials: true,
});

// Response interceptor: Uniform error formatting
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Extract meaningful error message from backend
    const message =
      error.response?.data?.message ||
      (error.code === 'ERR_NETWORK'
        ? 'Cannot connect to backend server. Make sure the backend is running.'
        : error.message || 'An unexpected error occurred');

    const formattedError = {
      message,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
      originalError: error,
    };

    return Promise.reject(formattedError);
  }
);

export default api;
