import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <h1>Witaj w Bingo!</h1>
      <div style={{ marginTop: 20 }}>
        <button
          style={{ marginRight: 10, padding: '10px 20px' }}
          onClick={() => navigate('/login')}
        >
          Zaloguj się
        </button>
        <button style={{ padding: '10px 20px' }} onClick={() => navigate('/register')}>
          Zarejestruj się
        </button>
      </div>
    </div>
  );
}
