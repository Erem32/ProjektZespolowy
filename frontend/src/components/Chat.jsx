// frontend/src/components/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../api';
import './Chat.css';

export default function Chat({ roomId, userId, squareIndex }) {
  const [msgs, setMsgs] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);

  const load = async () => {
    try {
      // pobieramy tylko pending, żeby zatwierdzać dowody
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

  const send = async (e) => {
    e.preventDefault();
    setError('');
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
    } catch (e) {
      console.error('Błąd wysyłania dowodu:', e);
      setError('Nie udało się wysłać dowodu.');
    }
  };

  const vote = async (id, status) => {
    try {
      await api.patch(`/rooms/${roomId}/messages/${id}`, { status });
      load();
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
          disabled={squareIndex === null}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={squareIndex === null}>
          Prześlij dowód
        </button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
