import { useState, useEffect, useRef } from 'react';
import api, { baseURL } from '../api';
import './Chat.css';

export default function Chat({ roomId, userId, squareIndex, onApprove, onSendProof }) {
  const [msgs, setMsgs] = useState([]);
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const timer = useRef(null);
  const messagesContainerRef = useRef(null);

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

  // 2) scroll do dołu **tylko** w obrębie kontenera wiadomości
  useEffect(() => {
    // tylko gdy mamy ref i ekran szerszy niż 768px
    if (window.innerWidth > 768 && messagesContainerRef.current) {
      const c = messagesContainerRef.current;
      c.scrollTop = c.scrollHeight;
    }
  }, [msgs]);

  // 3) pending logic
  const pendingIdx = new Set(msgs.filter((m) => m.status === 'pending').map((m) => m.square_index));
  const isPending = squareIndex !== null && pendingIdx.has(squareIndex);

  // 4) reset pola po przejściu na pending
  useEffect(() => {
    if (squareIndex !== null && isPending) {
      onSendProof?.();
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

      setText('');
      setFile(null);
      await load();
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

      <div className="messages" ref={messagesContainerRef}>
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.status}`}>
            <strong>Użytkownik {m.user_id}:</strong>
            {m.square_index != null && <p className="msg-square">Pole #{m.square_index}</p>}
            {m.text && <p className="msg-text">{m.text}</p>}
            {m.image_path &&
              (/\.(mp4|webm|ogg)$/i.test(m.image_path) ? (
                <video src={`${baseURL}${m.image_path}`} controls className="msg-media" />
              ) : (
                <img src={`${baseURL}${m.image_path}`} alt="plik" className="msg-media" />
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
