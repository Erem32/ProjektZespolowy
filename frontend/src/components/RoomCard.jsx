import React, { useState } from 'react';
import api from '../api';
import './RoomCard.css';

export default function RoomCard({ room, userId, onEnter }) {
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const full = room.players >= 4;

  const handleJoinClick = () => {
    setShowLogin(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/rooms/${room.id}/join`, {
        user_id: userId,
        password,
      });
      onEnter(room.id);
    } catch (e) {
      setError(e.response?.data?.detail || 'Nie udało się dołączyć.');
    }
  };

  return (
    <div className="room-card">
      <div className="room-card-header">
        <h3>{room.name}</h3>
        <p className="room-players">{room.players}/4 graczy</p>
      </div>

      {!showLogin ? (
        <button className="btn-enter" onClick={handleJoinClick} disabled={full}>
          {full ? 'Pełny' : 'Wejdź'}
        </button>
      ) : (
        <form className="room-login-form" onSubmit={handleSubmit}>
          <input
            className="password-input"
            type="password"
            placeholder="Hasło pokoju"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-submit">
            Potwierdź
          </button>
          {error && <p className="room-error">{error}</p>}
        </form>
      )}
    </div>
  );
}
