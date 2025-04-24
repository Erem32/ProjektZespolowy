import React from 'react';
import RegisterForm from '../components/RegisterForm';
import api from '../api.js';
import './RegisterPage.css';

export default function RegisterPage() {
  const handleRegister = async (data) => {
    const { name, email, password } = data;
    try {
      const response = await api.post('/auth/register', { name, email, password });
      console.log('Rejestracja udana:', response.data);
      alert('Rejestracja powiodła się!');
    } catch (error) {
      console.error('Błąd rejestracji:', error);
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
