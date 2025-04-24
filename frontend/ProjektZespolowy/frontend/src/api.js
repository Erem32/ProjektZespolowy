// src/api.js
import axios from 'axios';

const api = axios.create({
  // point directly  FastAPI server
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
