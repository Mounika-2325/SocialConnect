import axios from 'axios';

const apiBaseUrl = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
const apiBasePath = apiBaseUrl.pathname.replace(/\/+$/, '');
if (!apiBasePath.endsWith('/api')) apiBaseUrl.pathname = `${apiBasePath}/api`;
const api = axios.create({ baseURL: apiBaseUrl.toString().replace(/\/$/, ''), timeout: 12000 });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('socialconnect-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK') return `Cannot reach the Vibely API at ${api.defaults.baseURL}. Start the backend and check its port.`;
  if (error.code === 'ECONNABORTED') return 'The API request timed out. Check that MongoDB is running and the backend can connect to it.';
  return fallback;
}

export default api;