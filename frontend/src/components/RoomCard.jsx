import React from 'react';

export default function RoomCard({ room, onEnter }) {
  const full = room.players >= 4;
  return (
    <div className="room-card">
      <h3>{room.name}</h3>
      <p>Gracze: {room.players}/4</p>
      <button onClick={() => onEnter(room.id)} disabled={full}>
        {full ? 'Pełny' : 'Wejdź'}
      </button>
    </div>
  );
}
