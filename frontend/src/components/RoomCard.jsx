import React from 'react';

export default function RoomCard({ room, onEnter }) {
  return (
    <div className="room-card" style={{ border: '1px solid #ccc', padding: 10, margin: 5 }}>
      <h3>{room.name}</h3>
      <p>Gracze: {room.players}</p>
      <button onClick={() => onEnter(room.id)}>Wejdź</button>
    </div>
  );
}
