import React from 'react';
import './Cell.css';

export default function Cell({ value, status, onClick }) {
  return (
    <div className={['cell', status].join(' ')} onClick={status === 'free' ? onClick : undefined}>
      {value}
    </div>
  );
}
