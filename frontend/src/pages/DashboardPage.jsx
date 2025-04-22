import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// zamiast api:
import { fetchRooms } from '../services/mockApi';
import RoomList from '../components/RoomList';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard – lista pokoi</h1>
      <RoomList rooms={rooms} onEnter={(id) => navigate(`/room/${id}`)} />
    </div>
  );
}
