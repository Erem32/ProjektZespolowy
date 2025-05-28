// src/pages/RoomPage.jsx  :contentReference[oaicite:0]{index=0}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './RoomPage.css';

export default function RoomPage({ userId }) {
  const { id: roomId } = useParams();
  const [squares, setSquares] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');

  // fetch both squares + room info
  useEffect(() => {
    Promise.all([api.get(`/rooms/${roomId}/squares`), api.get(`/rooms/${roomId}`)])
      .then(([sqRes, roomRes]) => {
        setSquares(sqRes.data);
        setWinner(roomRes.data); // { id, name, winner_id, winner_color }
      })
      .catch((e) => {
        console.error(e);
        setError('Nie udało się załadować pokoju.');
      });
  }, [roomId]);

  const handleClick = async (sq) => {
    if (sq.owner_id || winner?.winner_id) return; // block clicks if already won
    try {
      const res = await api.post(`/rooms/${roomId}/squares/${sq.index}/claim`, {
        user_id: Number(userId),
      });
      setSquares((prev) =>
        prev.map((s) =>
          s.id === res.data.id ? { ...s, owner_id: res.data.owner_id, color: res.data.color } : s
        )
      );
      // if this claim just won, update our modal state too
      if (res.data.win) {
        setWinner({
          ...winner,
          winner_id: res.data.owner_id,
          winner_color: res.data.color,
        });
      }
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

      {/* permanent modal if someone’s already won */}
      {winner?.winner_id && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🏆 Mamy zwycięzcę!</h2>
            <div className="winner-color-block" style={{ background: winner.winner_color }} />
            <p>
              Gracz koloru <strong>{winner.winner_color}</strong> wygrał tę grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
