// src/pages/RegisterPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ↖️  DODANE
import RegisterForm from '../components/RegisterForm';
import api from '../api.js';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ↖️  DODANE

  const handleRegister = async (data) => {
    const { name, email, password } = data;
    try {
      // 1) Rejestracja
      await api.post('/auth/register', { name, email, password });

      // 2) Automatyczne logowanie
      const loginRes = await api.post('/auth/login', { email, password });
      const { user, access_token } = loginRes.data;

      // 3) localStorage
      localStorage.setItem('userId', user.id);
      localStorage.setItem('username', user.email);
      if (access_token) localStorage.setItem('accessToken', access_token);

      // 4) AuthContext
      login({ id: user.id, email: user.email }); // ↖️  DODANE

      // 5) Dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Błąd podczas rejestracji/logowania:', error);
      alert(error.response?.data?.detail || 'Coś poszło nie tak podczas rejestracji');
    }
  };

  return (
    <div className="auth-container">
      <h1>Rejestracja</h1>

      <div className="auth-form">
        <RegisterForm onSubmit={handleRegister} />
      </div>

      {/* ⇩ NOWY link do logowania ⇩ */}
      <p style={{ marginTop: '1rem' }}>
        Masz konto?{' '}
        <button
          onClick={() => navigate('/login')}
          style={{
            color: '#3498db',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Zaloguj się
        </button>
      </p>
    </div>
  );
}
