import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BingoBoard from '../components/BingoBoard';
import { api } from '../services/api';
import './RoomPage.css';

export default function RoomPage() {
  const { id } = useParams();
  const initialCells = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    value: i + 1,
    status: 'free',
  }));
  const [cells, setCells] = useState(initialCells);
  const [error, setError] = useState(null);

  const handleCellClick = async (cellId) => {
    try {
      await api.post(`/rooms/${id}/cells/${cellId}/reserve`);
      setCells((prev) => prev.map((c) => (c.id === cellId ? { ...c, status: 'taken' } : c)));
      setError(null);
    } catch (e) {
      if (e.response?.status === 409) {
        setError('To pole jest już zajęte!');
      } else {
        setError('Błąd rezerwacji pola.');
      }
    }
  };

  return (
    <div className="room-container">
      <h1>Pokój: {id}</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="bingo-board-wrapper">
        <BingoBoard cells={cells} onCellClick={handleCellClick} />
      </div>
    </div>
  );
}
