import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './RoomPage.css';

export default function RoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ← zawsze aktualny
  const userId = user?.id;

  const [squares, setSquares] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');

  const loadRoom = async () => {
    try {
      const [sqRes, roomRes] = await Promise.all([
        api.get(`/rooms/${roomId}/squares`),
        api.get(`/rooms/${roomId}`),
      ]);
      setSquares(sqRes.data);
      setWinner(roomRes.data);
    } catch {
      setError('Nie udało się załadować pokoju.');
    }
  };

  useEffect(() => {
    loadRoom();
  }, [roomId]);

  const claim = async (sq) => {
    if (sq.owner_id || winner?.winner_id) return;
    try {
      const res = await api.post(`/rooms/${roomId}/squares/${sq.index}/claim`, { user_id: userId });

      setSquares((prev) =>
        prev.map((s) =>
          s.id === res.data.id ? { ...s, owner_id: res.data.owner_id, color: res.data.color } : s
        )
      );

      if (res.data.win) {
        const roomRes = await api.get(`/rooms/${roomId}`);
        setWinner(roomRes.data);
      }
    } catch {
      setError('Nie udało się zarezerwować pola.');
    }
  };

  return (
    <div className="room-container">
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#2980b9',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
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
            const free = !sq.owner_id;
            return (
              <div
                key={sq.id}
                className={free ? 'cell free' : 'cell taken'}
                style={sq.color && !free ? { background: sq.color } : {}}
                onClick={() => free && claim(sq)}
              >
                {free ? sq.index + 1 : ''}
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
