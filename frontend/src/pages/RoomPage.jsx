import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BingoBoard from '../components/BingoBoard';
import './RoomPage.css';

export default function RoomPage() {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [cells, setCells] = useState([]);

  useEffect(() => {
    // tutaj fetchujesz komórki z API, na razie wrzucimy przykładowe:
    const initial = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      value: i + 1,
      status: 'free',
    }));
    setCells(initial);
  }, [id]);

  const handleCellClick = (cellId) => {
    // tutaj Twój kod rezerwacji, np. fetch do backendu
    // w razie błędu:
    // setError('Błąd rezerwacji pola.');
    console.log('Kliknięto komórkę', cellId);
  };

  return (
    <div className="room-container">
      <h1 className="room-title">Pokój: {id}</h1>
      {error && <div className="error-message">{error}</div>}
      <div className="board-wrapper">
        <BingoBoard cells={cells} onCellClick={handleCellClick} />
      </div>
    </div>
  );
}
