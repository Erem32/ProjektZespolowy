// src/pages/RoomPage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './RoomPage.css'; // ← make sure this path is correct

export default function RoomPage({ userId }) {
  const { id: roomId } = useParams();
  const [squares, setSquares] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/rooms/${roomId}/squares`)
      .then((res) => setSquares(res.data))
      .catch((e) => {
        console.error(e);
        setError('Nie udało się pobrać planszy.');
      });
  }, [roomId]);

  const handleClick = async (sq) => {
    if (sq.owner_id) return;
    try {
      const res = await api.post(`/rooms/${roomId}/squares/${sq.index}/claim`, {
        user_id: Number(userId),
      });
      setSquares((prev) =>
        prev.map((s) =>
          s.id === res.data.id ? { ...s, owner_id: res.data.owner_id, color: res.data.color } : s
        )
      );
    } catch (e) {
      console.error(e);
      setError('Nie udało się zarezerwować pola.');
    }
  };

  return (
    <div className="room-container">
      <h1 className="room-title">Pokój #{roomId}</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="board-wrapper">
        <div className="bingo-board">
          {squares.map((sq) => {
            const isFree = !sq.owner_id;
            const cellClass = isFree ? 'cell free' : 'cell taken';
            return (
              <div
                key={sq.id}
                className={cellClass}
                style={sq.color && !isFree ? { background: sq.color } : {}}
                onClick={() => isFree && handleClick(sq)}
              >
                {isFree ? sq.index + 1 : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
