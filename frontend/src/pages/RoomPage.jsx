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
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const [chatSquare, setChatSquare] = useState(null);
  const [pending, setPending] = useState({}); // map index → color
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
  const loadPending = async () => {
    // fetch ALL pending proofs, now including user_color
    const res = await api.get(`/rooms/${roomId}/messages?status=pending`);
    // build a map: square_index → user_color
    const map = {};
    res.data.forEach((m) => {
      if (m.square_index != null) map[m.square_index] = m.user_color;
    });
    setPending(map);
  };
  useEffect(() => {
    loadRoom();
    loadPending();
    // every 5s, refresh both board state and pending proofs
    const refreshId = setInterval(() => {
      loadRoom();
      loadPending();
    }, 5000);
    // cleanup on unmount or room change
    return () => clearInterval(refreshId);
  }, [roomId]);

  return (
    <div className="room-container">
      <button onClick={() => navigate('/dashboard')} className="back-button">
        ← Powrót
      </button>

      <h1 className="room-title">Pokój #{roomId}</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="room-content">
        <div className="board-wrapper">
          <div className="bingo-board">
            {squares.map((sq) => {
              const free = !sq.owner_id;
              const lightColor = pending[sq.index];
              const isPending = free && Boolean(lightColor);

              return (
                <div
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

        <div className="chat-wrapper">
          +{' '}
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

      {winner?.winner_id && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🏆 Mamy zwycięzcę!</h2>
            <div className="winner-color-block" style={{ background: winner.winner_color }} />
            <p>
              Gracz <strong>{winner.winner_name}</strong> wygrał grę.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
