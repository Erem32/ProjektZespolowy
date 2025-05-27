// src/pages/CreateRoomPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateRoomPage.css';

export default function CreateRoomPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Błąd tworzenia pokoju');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="create-room-container">
      <h1 className="create-room-title">Stwórz nowy pokój</h1>
      <form className="create-room-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nazwa pokoju</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Wpisz nazwę"
          />
        </div>
        <div className="form-group">
          <label>Hasło pokoju</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Wpisz hasło"
          />
        </div>
        {error && <div className="create-room-error">{error}</div>}
        <button type="submit" className="btn-create-room">
          Stwórz pokój
        </button>
      </form>
    </div>
  );
}
