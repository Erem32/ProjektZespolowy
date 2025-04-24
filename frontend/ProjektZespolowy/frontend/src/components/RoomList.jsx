import React, { useEffect, useState } from 'react';
import { fetchRooms } from '../services/mockApi';
import RoomCard from './RoomCard';

export default function RoomList({ onEnter }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms().then(setRooms);
  }, []);

  return (
    <div className="room-list" style={{ display: 'flex', flexWrap: 'wrap' }}>
      {rooms.map((r) => (
        <RoomCard key={r.id} room={r} onEnter={onEnter} />
      ))}
    </div>
  );
}
