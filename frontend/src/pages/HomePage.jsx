import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Witaj w Bingo!</h1>
      <div className="home-buttons">
        <button className="login-btn" onClick={() => navigate('/login')}>
          Zaloguj się
        </button>
        <button className="register-btn" onClick={() => navigate('/register')}>
          Zarejestruj się
        </button>
      </div>
    </div>
  );
}
