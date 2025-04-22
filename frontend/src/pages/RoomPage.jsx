import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BingoBoard from '../components/BingoBoard';
import { api } from '../services/api';

export default function RoomPage() {
  const { id } = useParams();
  const initial = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    value: i + 1,
    status: 'free',
  }));
  const [cells, setCells] = useState(initial);
  const [error, setError] = useState(null);

  const handleCellClick = async (cellId) => {
    try {
      await api.post(`/rooms/${id}/cells/${cellId}/reserve`);
      setCells((c) => c.map((x) => (x.id === cellId ? { ...x, status: 'taken' } : x)));
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
    <div style={{ padding: 20 }}>
      <h1>Pokój: {id}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <BingoBoard cells={cells} onCellClick={handleCellClick} />
    </div>
  );
}
