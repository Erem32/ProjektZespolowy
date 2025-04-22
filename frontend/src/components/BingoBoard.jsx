import React from 'react';
import Cell from './Cell';
import '../index.css';

export default function BingoBoard({ cells, onCellClick }) {
  return (
    <div className="bingo-board">
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
