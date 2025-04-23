// src/pages/RegisterPage.jsx

import React from 'react';
import RegisterForm from '../components/RegisterForm';
import api from '../api.js';

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
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem', border: '1px solid #eee' }}>
      <h1>Rejestracja</h1>
      {}
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
