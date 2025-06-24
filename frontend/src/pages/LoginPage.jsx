import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // ⬅️ DODANE
import LoginForm from '../components/LoginForm';
import api from '../api.js';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ⬅️ DODANE

  const handleLogin = async (data) => {
    const { email, password } = data;
    try {
      const response = await api.post('/auth/login', { email, password });

      // { message: "Login successful!", user: { id, email }, access_token? }
      const { user } = response.data;

      // 1) localStorage (jak wcześniej)
      localStorage.setItem('userId', user.id);
      localStorage.setItem('username', user.email);
      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
      }

      // 2) AuthContext – cały UI od razu zna zalogowanego
      login({ id: user.id, email: user.email }); // ⬅️ DODANE

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

      {/* --- przycisk / link do rejestracji --- */}
      <p style={{ marginTop: '1rem' }}>
        Nie masz konta?{' '}
        <button
          onClick={() => navigate('/register')}
          style={{
            color: '#3498db',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Zarejestruj się
        </button>
      </p>
    </div>
  );
}
