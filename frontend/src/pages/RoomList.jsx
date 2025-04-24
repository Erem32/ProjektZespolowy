import React from 'react';
import './RoomList.css';

export default function RoomList({ rooms, onEnter }) {
  if (!rooms.length) {
    return <p className="no-rooms">Brak pokoi do wyświetlenia.</p>;
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <div key={room.id} className="room-card">
          <div>
            <h2>{room.name}</h2>
            <p>Gracze: {room.players}</p>
          </div>
          <button onClick={() => onEnter(room.id)}>Wejdź</button>
        </div>
      ))}
    </div>
  );
}
