// src/services/api.js
import api from '../api';

// --- AUTH ---
export function register(name, email, password) {
  return api.post('/auth/register', { name, email, password }).then((r) => r.data);
}
export function login(email, password) {
  return api.post('/auth/login', { email, password }).then((r) => r.data);
}

// --- ROOMS ---
export function fetchRooms() {
  return api.get('/rooms').then((r) => r.data);
}
export function createRoom(name, password) {
  return api.post('/rooms', { name, password }).then((r) => r.data);
}
export function joinRoom(roomId, password) {
  // FastAPI expects a raw string body for single-param endpoints
  return api.post(`/rooms/${roomId}/enter`, password).then((r) => r.data);
}

// --- BINGO CELLS ---
export function reserveCell(roomId, cellId) {
  return api.post(`/rooms/${roomId}/cells/${cellId}/reserve`).then((r) => r.data);
}
