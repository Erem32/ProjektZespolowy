// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordModal from '../components/PasswordModal';
import './DashboardPage.css';

export default function DashboardPage({ userId }) {
  const [rooms, setRooms] = useState([]);
  const [filter, setFilter] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/rooms')
      .then((res) => res.json())
      .then(setRooms)
      .catch(console.error);
  }, []);

  const filteredRooms = rooms.filter((r) => r.name.toLowerCase().includes(filter.toLowerCase()));

  const openModal = (room) => setSelectedRoom(room);
  const closeModal = () => setSelectedRoom(null);
  const onJoinSuccess = (color) => {
    localStorage.setItem('userColor', color);
    closeModal();
    navigate(`/room/${selectedRoom.id}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard – lista pokoi</h1>
        <button className="btn-create" onClick={() => navigate('/create-room')}>
          Stwórz pokój
        </button>
      </div>

      <div className="dashboard-search">
        <input
          type="text"
          placeholder="Szukaj pokoju..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="rooms-grid">
        {filteredRooms.map((room) => (
          <div key={room.id} className="room-card">
            <div className="room-name">{room.name}</div>
            <button className="btn-enter" onClick={() => openModal(room)}>
              Wejdź
            </button>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <PasswordModal
          room={selectedRoom}
          userId={userId}
          onCancel={closeModal}
          onSuccess={onJoinSuccess}
        />
      )}
    </div>
  );
}
