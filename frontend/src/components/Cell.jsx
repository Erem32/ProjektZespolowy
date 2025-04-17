import React from 'react';

export default function Cell({ value, status, onClick }) {
  const style = {
    width: 60,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #333',
    cursor: status === 'free' ? 'pointer' : 'default',
    backgroundColor: status === 'free' ? '#fff' : '#ccc',
    userSelect: 'none',
  };

  return (
    <div style={style} onClick={status === 'free' ? onClick : undefined}>
      {value}
    </div>
  );
}
