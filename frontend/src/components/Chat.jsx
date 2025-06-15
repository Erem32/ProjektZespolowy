// frontend/src/components/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import './Chat.css';

export default function Chat({ roomId, userId, squareIndex, onApprove, onSendProof }) {
  const [msgs, setMsgs] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  // Load only pending messages so we know which squares are in flight
  const load = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}/messages/?status=pending`);
      setMsgs(res.data);
    } catch (e) {
      console.error('Błąd ładowania czatu:', e);
    }
  };

  useEffect(() => {
    load();
    timer.current = setInterval(load, 5000);
    return () => clearInterval(timer.current);
  }, [roomId]);

  // Track which squares already have a pending proof
  const pendingSquares = new Set(msgs.map((m) => m.square_index));
  const isPendingSquare = squareIndex !== null && pendingSquares.has(squareIndex);

  const send = async (e) => {
    e.preventDefault();
    setError('');

    // Block sending if the square is already pending
    if (isPendingSquare) {
      setError(`Pole #${squareIndex} jest już weryfikowane. Poczekaj na decyzję.`);
      return;
    }

    if (squareIndex === null) {
      setError('Wybierz pole, które chcesz potwierdzić.');
      return;
    }
    if (!file) {
      setError('Proszę dołączyć zdjęcie potwierdzające wykonanie zadania.');
      return;
    }

    try {
      const data = new FormData();
      data.append('user_id', userId);
      data.append('file', file);
      data.append('square_index', squareIndex);

      await api.post(`/rooms/${roomId}/messages/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFile(null);
      load();
      if (onSendProof) onSendProof();
    } catch (e) {
      console.error('Błąd wysyłania dowodu:', e);
      // If backend also rejects with 409, show its message
      if (e.response?.status === 409) {
        setError(e.response.data.detail);
      } else {
        setError('Nie udało się wysłać dowodu.');
      }
    }
  };

  const vote = async (id, status) => {
    try {
      await api.patch(`/rooms/${roomId}/messages/${id}`, { status });
      load();
      if (status === 'approved' && onApprove) onApprove();
    } catch (e) {
      console.error('Błąd weryfikacji dowodu:', e);
    }
  };

  return (
    <div className="chat">
      <h2>Chat w pokoju #{roomId}</h2>
      <div className="chat-info">
        {squareIndex !== null ? `Wybrane pole: #${squareIndex}` : 'Kliknij pole, aby wysłać dowód.'}
      </div>

      <div className="messages">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.status}`}>
            <p className="msg-square">Pole #{m.square_index}</p>
            <strong>Użytkownik {m.user_id}:</strong>
            {m.image_path && (
              <img src={m.image_path} alt="dowód" style={{ maxWidth: 200, maxHeight: 200 }} />
            )}
            {m.status === 'pending' && m.user_id !== userId && (
              <div className="actions">
                <button onClick={() => vote(m.id, 'approved')}>✅</button>
                <button onClick={() => vote(m.id, 'rejected')}>❌</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={send} className="chat-form">
        <input
          type="file"
          accept="image/*"
          disabled={squareIndex === null || isPendingSquare}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={squareIndex === null || isPendingSquare}>
          Prześlij dowód
        </button>
      </form>

      {/* show either a blocking message for pending or any other error */}
      {isPendingSquare && (
        <div className="error">Pole #{squareIndex} jest już weryfikowane. Poczekaj na decyzję.</div>
      )}
      {!isPendingSquare && error && <div className="error">{error}</div>}
    </div>
  );
}
