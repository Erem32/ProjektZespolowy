import React from 'react';
import RoomCard from './RoomCard';
import './RoomList.css';

export default function RoomList({ rooms, onEnter }) {
  // Gdy nie ma żadnych pokoi
  if (!rooms.length) {
    return <p className="no-rooms">Brak dostępnych pokoi.</p>;
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onEnter={onEnter} />
      ))}
    </div>
  );
}
