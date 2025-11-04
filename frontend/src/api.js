import axios from 'axios';

// Create a central "instance" of axios
const api = axios.create({
  baseURL: 'http://localhost:4000/api', // Your backend's base URL
});

// This is an "interceptor" - a function that "catches" every request
// before it gets sent.
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