import React from 'react';
import Cell from './Cell';

export default function BingoBoard({ cells, onCellClick }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 4,
        marginTop: 20,
      }}
    >
      {cells.map((cell) => (
        <Cell
          key={cell.id}
          value={cell.value}
          status={cell.status}
          onClick={() => onCellClick(cell.id)}
        />
      ))}
    </div>
  );
}
