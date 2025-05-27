import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms, createRoom } from '../services/mockApi';
import RoomList from '../components/RoomList';
import CreateRoomButton from '../components/CreateRoomButton';
import './DashboardPage.css';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // load rooms once
  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  // ← move handleCreate inside the component so it sees setRooms & navigate
  const handleCreate = async () => {
    const name = prompt('Nazwa pokoju?');
    const password = prompt('Hasło pokoju?');
    if (!name || !password) return;

    try {
      const newRoom = await createRoom(name, password);
      setRooms((prev) => [...prev, newRoom]);
      // optionally: navigate(`/room/${newRoom.id}`);
    } catch (err) {
      alert('Nie udało się utworzyć pokoju: ' + err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard – lista pokoi</h1>
      <div className="room-list">
        {/* now handleCreate is in scope */}
        <CreateRoomButton onCreate={handleCreate} />
        <RoomList rooms={rooms} onEnter={(id) => navigate(`/room/${id}`)} />
      </div>
    </div>
  );
}
