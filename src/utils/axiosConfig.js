// src/utils/axiosConfig.js
import axios from 'axios';

// Base URL - adjust if your backend is on a different URL
axios.defaults.baseURL = 'http://localhost:5000';

// Add a request interceptor to include token with every request
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // If we get a 401 (Unauthorized), clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;