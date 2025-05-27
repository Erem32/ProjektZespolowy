// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';

export default function App() {
  const userId = localStorage.getItem('userId');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage userId={userId} />} />
        <Route path="/create-room" element={<CreateRoomPage />} />
        <Route path="/room/:id" element={<RoomPage userId={userId} />} />
      </Routes>
    </BrowserRouter>
  );
}
