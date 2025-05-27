import React from 'react';
import RoomCard from './RoomCard';

export default function RoomList({ rooms, onEnter }) {
  return (
    <div className="room-list" style={{ display: 'flex', flexWrap: 'wrap' }}>
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} onEnter={onEnter} />
      ))}
    </div>
  );
}
