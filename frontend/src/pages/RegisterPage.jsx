// src/pages/RegisterPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import api from '../api.js';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (data) => {
    const { name, email, password } = data;
    try {
      // 1) Rejestracja
      await api.post('/auth/register', { name, email, password });
      // 2) Automatyczne logowanie
      const loginRes = await api.post('/auth/login', { email, password });
      // 3) Zapisz w localStorage
      localStorage.setItem('userId', loginRes.data.user.id);
      localStorage.setItem('username', loginRes.data.user.email);
      // 4) Przejdź do dashboard
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
    </div>
  );
}
