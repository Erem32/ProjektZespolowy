import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../services/mockApi';
import RoomList from '../components/RoomList';
import './DashboardPage.css';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Dashboard – lista pokoi</h1>
      <div className="room-list">
        <RoomList rooms={rooms} onEnter={(id) => navigate(`/room/${id}`)} />
      </div>
    </div>
  );
}
