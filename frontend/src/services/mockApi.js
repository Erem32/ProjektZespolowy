// frontend/src/services/api.js
export async function fetchRooms() {
  const res = await fetch('http://localhost:8000/rooms');
  return res.json();
}

export async function createRoom(name, password) {
  const res = await fetch('http://localhost:8000/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) throw new Error('Failed to create room');
  return res.json(); // { id: 5, name: "My Room" }
}
