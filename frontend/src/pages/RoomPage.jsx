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
              return (
                <div
                  key={sq.id}
                  className={free ? 'cell free' : 'cell taken'}
                  style={sq.color && !free ? { background: sq.color } : {}}
                  onClick={() => free && setChatSquare(sq.index)}
                >
                  {sq.text}
                </div>
              );
            })}
          </div>
        </div>

        <div className="chat-wrapper">
          <Chat roomId={roomId} userId={userId} squareIndex={chatSquare} />
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
