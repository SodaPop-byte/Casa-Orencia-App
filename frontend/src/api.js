import axios from 'axios';

// CRITICAL FINAL FIX: Use the complete, secure HTTPS URL for production
const LIVE_RENDER_URL = 'https://casa-orencia-api.onrender.com/api'; // <-- PASTE YOUR FULL, CORRECT RENDER URL HERE
const LOCAL_URL = 'http://localhost:4000/api';

const baseURL = process.env.NODE_ENV === 'production'
  ? LIVE_RENDER_URL
  : LOCAL_URL;

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