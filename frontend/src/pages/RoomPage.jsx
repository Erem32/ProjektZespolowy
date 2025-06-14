// frontend/src/pages/RoomPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './RoomPage.css';
import Chat from '../components/Chat';

export default function RoomPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;

  const [squares, setSquares] = useState([]);
  const [roomDetail, setRoomDetail] = useState(null);
  const [error, setError] = useState('');
  const [chatSquare, setChatSquare] = useState(null);
  const [pending, setPending] = useState({});

  const loadRoom = async () => {
    try {
      const [sqRes, detRes] = await Promise.all([
        api.get(`/rooms/${roomId}/squares`),
        api.get(`/rooms/${roomId}`),
      ]);
      setSquares(sqRes.data);
      setRoomDetail(detRes.data);
    } catch {
      setError('Nie udało się załadować pokoju.');
    }
  };

  const loadPending = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}/messages?status=pending`);
      const map = {};
      res.data.forEach((m) => {
        if (m.square_index != null) map[m.square_index] = m.user_color;
      });
      setPending(map);
    } catch {}
  };

  useEffect(() => {
    loadRoom();
    loadPending();
    const iv = setInterval(() => {
      loadRoom();
      loadPending();
    }, 5000);
    return () => clearInterval(iv);
  }, [roomId]);

  return (
    <div className="room-container">
      <div className="room-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Powrót
        </button>
        <h1 className="room-title">Pokój #{roomId}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="room-content">
        {/* ← Sidebar */}
        <aside className="players-sidebar">
          <h2>Gracze: {roomDetail?.players_count}/4</h2>
          <ul>
            {roomDetail?.players.map((p) => (
              <li key={p.id}>
                <span className="player-color-block" style={{ background: p.color }} />
                {p.email}
              </li>
            ))}
          </ul>
        </aside>

        {/* ← Bingo board */}
        <div className="board-wrapper">
          <div className="bingo-board">
            {squares.map((sq) => {
              const free = !sq.owner_id;
              const lightColor = pending[sq.index];
              const isPending = free && Boolean(lightColor);

              return (
                <div
                  key={sq.id}
                  className={isPending ? 'cell pending' : free ? 'cell free' : 'cell taken'}
                  style={
                    isPending
                      ? { background: lightColor, opacity: 0.5, cursor: 'default' }
                      : sq.color && !free
                        ? { background: sq.color }
                        : {}
                  }
                  onClick={() => free && setChatSquare(sq.index)}
                >
                  {sq.text}
                </div>
              );
            })}
          </div>
        </div>

        {/* ← Chat panel */}
        <div className="chat-wrapper">
          <Chat
            roomId={roomId}
            userId={userId}
            squareIndex={chatSquare}
            onApprove={() => {
              loadRoom();
              loadPending();
            }}
            onSendProof={() => loadPending()}
          />
        </div>
      </div>

      {roomDetail?.winner_id && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🏆 Mamy zwycięzcę!</h2>
            <div className="winner-color-block" style={{ background: roomDetail.winner_color }} />
            <p>
              Gracz <strong>{roomDetail.winner_name}</strong> wygrał grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
