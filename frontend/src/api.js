// src/api.js
import axios from 'axios';

const baseURL = process.env.REACT_APP_URL || 'http://localhost:8000';

const api = axios.create({
  // point directly  FastAPI server
  baseURL: process.env.REACT_APP_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export { baseURL };
export default api;
