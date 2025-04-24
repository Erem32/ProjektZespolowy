import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../services/mockApi';
import RoomList from '../components/RoomList';
import './DashboardPage.css';

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard – lista pokoi</h1>

      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Szukaj pokoju..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <RoomList rooms={filteredRooms} onEnter={(id) => navigate(`/room/${id}`)} />
    </div>
  );
}
