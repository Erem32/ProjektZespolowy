// src/components/PasswordModal.jsx
import { useState } from 'react';
import api from '../api';
import './PasswordModal.css';

export default function PasswordModal({ room, userId, onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      const res = await api.post(`/rooms/${room.id}/join`, {
        user_id: userId,
        password,
      });

      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail || 'Niepoprawne hasło');
      }

      const { color } = await res.json();
      onSuccess(color);
    } catch (err) {
      setError(err.message || 'Niepoprawne hasło');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">Wejdź do “{room.name}”</h2>

        <input
          type="password"
          className="modal-input"
          placeholder="Hasło pokoju"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          autoFocus
        />

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Anuluj
          </button>
          <button className="btn-join" onClick={handleJoin}>
            Dołącz
          </button>
        </div>
      </div>
    </div>
  );
}
