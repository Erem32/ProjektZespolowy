// src/components/PasswordModal.jsx
import { useState } from 'react';
import './PasswordModal.css';

export default function PasswordModal({ room, userId, onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    try {
      const res = await fetch(`/rooms/${room.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Błąd');
      }

      const { color } = await res.json();
      onSuccess(color);
    } catch (err) {
      /* ──────  JEDYNA ZMIANA  ──────
         pokaż tekst lub, gdy obiekt, zserializuj go → brak [object Object] */
      setError(
        typeof err === 'string' ? err : err.message || JSON.stringify(err) || 'Niepoprawne hasło'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl mb-4">Wejdź do {room.name}</h2>

        <input
          type="password"
          className="w-full border px-2 py-1 mb-2"
          placeholder="Hasło pokoju"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-red-600 mb-2">{error}</div>}

        <div className="flex justify-end space-x-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onCancel}>
            Anuluj
          </button>
          <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={handleJoin}>
            Dołącz
          </button>
        </div>
      </div>
    </div>
  );
}
