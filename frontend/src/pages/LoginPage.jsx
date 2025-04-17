import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const handleLogin = (data) => {
    console.log('Logowanie:', data);
    // tu w przyszłości wywołanie api.post('/auth/login', data)
  };

  return (
    <div>
      <h1>Logowanie</h1>
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
