import axios from 'axios';

// CRITICAL FINAL FIX: Hardcode the full live Render URL with /api
// This bypasses Vercel's environment variable issues for production
const LIVE_RENDER_URL = 'https://casa-orencia-app.onrender.com/api'; // ✅ FIXED: Removed space, added /api
const LOCAL_URL = 'http://localhost:4000/api';

const baseURL = process.env.NODE_ENV === 'production'
  ? LIVE_RENDER_URL // Use the absolute live URL
  : LOCAL_URL;      // Use the local URL for development

// Create a central "instance" of axios
const api = axios.create({
  baseURL: baseURL,
  // Add a timeout failsafe just in case
  timeout: 15000, 
});

// This is an "interceptor" that adds the JWT token to the header of every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // CRITICAL: Manually set the Content-Type for file uploads
    if (config.data instanceof FormData) {
        // Axios handles multipart/form-data boundaries; we ensure the type is set.
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