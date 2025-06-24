import React from 'react';
import RoomCard from './RoomCard';
import './RoomList.css';

export default function RoomList({ rooms, onEnter, userId }) {
  if (!rooms.length) {
    return <p className="no-rooms">Brak pokoi do wyświetlenia.</p>;
  }

  return (
    <div className="room-list">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onEnter={onEnter} userId={userId} />
      ))}
    </div>
  );
}
