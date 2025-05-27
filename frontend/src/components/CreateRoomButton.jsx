import React from 'react';

export default function CreateRoomButton({ onCreate }) {
  return (
    <button className="create-room-btn" onClick={onCreate}>
      Utwórz nowy pokój
    </button>
  );
}
