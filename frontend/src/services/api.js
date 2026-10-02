import axios from 'axios';

export function resolveApiBaseUrl(rawInput) {
  let urlStr = String(rawInput || '').trim();
  if (!urlStr) {
    urlStr = 'https://socialconnect-toy6.onrender.com';
  }

  // Remove trailing slashes
  urlStr = urlStr.replace(/\/+$/, '');

  // Strip duplicate /api prefixes if present (e.g. /api/api)
  while (urlStr.endsWith('/api/api')) {
    urlStr = urlStr.slice(0, -4);
  }

  // Ensure it ends with /api
  if (!urlStr.endsWith('/api')) {
    urlStr = `${urlStr}/api`;
  }

  return urlStr;
}

const apiBaseUrl = resolveApiBaseUrl(import.meta.env?.VITE_API_URL);

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60000, // 60s timeout to allow for Render free-tier cold starts
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('socialconnect-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK') {
    return `Cannot reach the Vibely API at ${api.defaults.baseURL}. If the backend is sleeping on Render (free tier), it may take ~30-50 seconds to wake up. Please wait a moment and try again.`;
  }
  if (error.code === 'ECONNABORTED') {
    return `The API request timed out at ${api.defaults.baseURL}. Render may still be waking up or connecting to MongoDB. Please try again in a few seconds.`;
  }
  return fallback;
}

export default api;