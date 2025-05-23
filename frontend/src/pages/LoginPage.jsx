// src/pages/LoginPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import api from '../api.js';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    const { email, password } = data;
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.detail || 'Nie udało się zalogować – spróbuj ponownie.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Logowanie</h1>
      <div className="auth-form">
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
