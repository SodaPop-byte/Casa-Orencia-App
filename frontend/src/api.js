import axios from 'axios';

// CRITICAL FIX: Base URL must be explicitly defined for production and development.
// VERCEL/RENDER automatically sets NODE_ENV to 'production'.
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://casa-orencia-api.onrender.com/api' // REPLACE THIS WITH YOUR FINAL RENDER URL (once known)
  : 'http://localhost:4000/api'; // Local development URL

// Create a central "instance" of axios
const api = axios.create({
  baseURL: baseURL,
});

// This is an "interceptor" that adds the JWT token to the header of every request.
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from local storage
    const token = localStorage.getItem('token');
    
    // 2. If the token exists, add it to the "Authorization" header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. Send the request (now with the token, if it exists)
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;