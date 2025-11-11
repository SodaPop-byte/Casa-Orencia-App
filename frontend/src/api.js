import axios from 'axios';

// CRITICAL FIX: Base URL must rely 100% on the REACT_APP_API_BASE environment variable.
// This is the cleanest structure, which we must assume Vercel uses correctly.
const baseURL = process.env.REACT_APP_API_BASE || 'http://localhost:4000/api'; 

// Create a central "instance" of axios
const api = axios.create({
  baseURL: baseURL,
});

// This is an "interceptor" that adds the JWT token to the header of every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // CRITICAL: Manually set the Content-Type for file uploads
    if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;