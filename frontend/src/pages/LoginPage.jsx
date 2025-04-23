// src/pages/LoginPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom'; // for redirecting after login
import LoginForm from '../components/LoginForm';
import api from '../api.js'; // Axios instance with baseURL

export default function LoginPage() {
  const navigate = useNavigate(); // hook to change route programmatically

  // This function is called when the form is valid and submitted
  const handleLogin = async (data) => {
    const { email, password } = data; // extract only the needed fields

    try {
      // Send a POST request to /auth/login on the FastAPI server
      const response = await api.post('/auth/login', { email, password });

      // On success, store the returned token (e.g. for authenticated calls)
      localStorage.setItem('accessToken', response.data.access_token);

      // Then redirect the user to the dashboard or another protected page
      navigate('/dashboard');
    } catch (error) {
      // If something went wrong (bad creds, network error), show an alert
      alert(error.response?.data?.detail || 'Nie udało się zalogować – spróbuj ponownie.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: '1rem' }}>
      <h1>Logowanie</h1>
      {/* Pass our handleLogin callback into the form */}
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
