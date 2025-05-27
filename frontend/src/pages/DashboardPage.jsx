// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, createRoom } from '../services/mockApi';
import RoomList from '../components/RoomList';
import CreateRoomButton from '../components/CreateRoomButton';
import './DashboardPage.css';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // helper to load all rooms
  const loadRooms = async () => {
    try {
      const data = await fetchRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    }
  };

  // load rooms on mount
  useEffect(() => {
    loadRooms();
  }, []);

  // create a new room, then reload the list
  const handleCreate = async () => {
    const name = prompt('Nazwa pokoju?');
    if (!name) return;
    const password = prompt('Hasło pokoju?');
    if (!password) return;

    try {
      await createRoom(name, password);
      await loadRooms();
      // or if you prefer to append only:
      // const newRoom = await createRoom(name, password);
      // setRooms(prev => [...prev, newRoom]);
    } catch (err) {
      alert('Nie udało się utworzyć pokoju: ' + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard – lista pokoi</h1>

      {/* Actions bar */}
      <div className="actions">
        <CreateRoomButton onCreate={handleCreate} />
      </div>

      {/* Room cards grid */}
      <div className="room-list">
        {rooms.length > 0 ? (
          <RoomList rooms={rooms} onEnter={(id) => navigate(`/room/${id}`)} />
        ) : (
          <p>Brak pokoi do wyświetlenia.</p>
        )}
      </div>
    </div>
  );
}
