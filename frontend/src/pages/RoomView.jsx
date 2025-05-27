// src/pages/RoomView.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function RoomView({ userId }) {
  const { id: roomId } = useParams();
  const [color] = useState(() => localStorage.getItem('userColor') || '#000');
  // Jeśli będziesz fetczować stan pola:
  // const [squares, setSquares] = useState([]);

  useEffect(() => {
    // fetch(`/rooms/${roomId}/state`).then(...);
  }, [roomId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Pokój {roomId}</h1>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 25 }).map((_, idx) => (
          <button
            key={idx}
            className="w-12 h-12 border rounded"
            style={{ backgroundColor: color }}
            // jeśli potem dasz warunek: style={{ backgroundColor: owner === userId ? color : undefined }}
          />
        ))}
      </div>
    </div>
  );
}
