import { useState, useEffect, useRef } from 'react';
import api from '../api';
import './Chat.css';

export default function Chat({ roomId, userId, squareIndex, onApprove, onSendProof }) {
  const [msgs, setMsgs] = useState([]);
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const timer = useRef(null);

  // 1) ładowanie wiadomości co 5s
  const load = async () => {
    try {
      const res = await api.get(`/rooms/${roomId}/messages`);
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

  // 2) czy wybrane pole jest teraz w pending?
  const pendingIdx = new Set(msgs.filter((m) => m.status === 'pending').map((m) => m.square_index));
  const isPending = squareIndex !== null && pendingIdx.has(squareIndex);

  // 3) efekt: jeśli wybrane pole zmieni się na pending → resetujemy wybór
  useEffect(() => {
    if (squareIndex !== null && isPending) {
      onSendProof?.(); // tu rodzic powinien zresetować squareIndex → null
    }
  }, [isPending, squareIndex, onSendProof]);

  const send = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !file) {
      setError('Wpisz wiadomość lub dołącz plik.');
      return;
    }
    if (squareIndex !== null && isPending) {
      setError(`Pole #${squareIndex} jest już weryfikowane.`);
      return;
    }

    try {
      const data = new FormData();
      data.append('user_id', userId);
      if (text.trim()) data.append('text', text.trim());
      if (file) data.append('file', file);
      if (squareIndex !== null) data.append('square_index', squareIndex);

      await api.post(`/rooms/${roomId}/messages/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // wyczyść inputy i odśwież
      setText('');
      setFile(null);
      await load();
      // *nie* resetujemy tu stanu, robi to efekt wyżej
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.detail || 'Nie udało się wysłać wiadomości.');
    }
  };

  const vote = async (id, status) => {
    try {
      await api.patch(`/rooms/${roomId}/messages/${id}`, { status });
      await load();
      if (status === 'approved') onApprove?.();
    } catch (e) {
      console.error('Błąd weryfikacji:', e);
    }
  };

  return (
    <div className="chat">
      <h2>Chat w pokoju #{roomId}</h2>
      <div className="chat-info">
        {squareIndex !== null
          ? `Wybrane pole: #${squareIndex}`
          : 'Kliknij pole, aby wysłać dowód lub wpisz tekst poniżej.'}
      </div>

      <div className="messages">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.status}`}>
            <strong>Użytkownik {m.user_id}:</strong>
            {m.square_index != null && <p className="msg-square">Pole #{m.square_index}</p>}
            {m.text && <p className="msg-text">{m.text}</p>}
            {m.image_path &&
              (/\.(mp4|webm|ogg)$/.test(m.image_path) ? (
                <video src={m.image_path} controls className="msg-media" />
              ) : (
                <img src={m.image_path} alt="plik" className="msg-media" />
              ))}
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
          type="text"
          placeholder="Napisz wiadomość..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Wyślij</button>
      </form>

      {isPending && <div className="error">Pole #{squareIndex} jest już weryfikowane.</div>}
      {!isPending && error && <div className="error">{error}</div>}
    </div>
  );
}
