// src/pages/RoomPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import './RoomPage.css';

export default function RoomPage({ userId }) {
  const { id: roomId } = useParams();
  const navigate = useNavigate();

  const [squares, setSquares] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');

  // Fetch both squares and room info (including winner_name)
  const loadRoom = async () => {
    try {
      const [sqRes, roomRes] = await Promise.all([
        api.get(`/rooms/${roomId}/squares`),
        api.get(`/rooms/${roomId}`), // musi zawierać winner_name
      ]);
      setSquares(sqRes.data);
      setWinner(roomRes.data);
    } catch (e) {
      console.error(e);
      setError('Nie udało się załadować pokoju.');
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const handleClick = async (sq) => {
    if (sq.owner_id || winner?.winner_id) return;
    try {
      const res = await api.post(`/rooms/${roomId}/squares/${sq.index}/claim`, {
        user_id: Number(userId),
      });
      // Aktualizuj planszę
      setSquares((prev) =>
        prev.map((s) =>
          s.id === res.data.id ? { ...s, owner_id: res.data.owner_id, color: res.data.color } : s
        )
      );
      // Jeśli to zwycięski ruch, przeładuj room, żeby pobrać winner_name
      if (res.data.win) {
        const roomRes = await api.get(`/rooms/${roomId}`);
        setWinner(roomRes.data);
      }
    } catch (e) {
      console.error(e);
      setError('Nie udało się zarezerwować pola.');
    }
  };

  const goBack = () => navigate('/dashboard');

  return (
    <div className="room-container">
      <button
        onClick={goBack}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#2980b9',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        ← Powrót do dashboard
      </button>

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

      {winner?.winner_id && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🏆 Mamy zwycięzcę!</h2>
            <div className="winner-color-block" style={{ background: winner.winner_color }} />
            <p>
              Gracz <strong>{winner.winner_name}</strong> wygrał tę grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
