import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import BingoBoard from '../components/BingoBoard';

export default function RoomPage() {
  const { id } = useParams();

  // tworzymy 25 pól: id od 0 do 24, każde z wartością i statusem 'free'
  const initialCells = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    value: i + 1,
    status: 'free',
  }));

  const [cells, setCells] = useState(initialCells);

  // po kliknięciu pola zmieniamy jego status na 'taken'
  const handleCellClick = (cellId) => {
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId ? { ...c, status: c.status === 'free' ? 'taken' : c.status } : c
      )
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Pokój: {id}</h1>
      <BingoBoard cells={cells} onCellClick={handleCellClick} />
    </div>
  );
}
