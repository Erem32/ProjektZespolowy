import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const handleRegister = (data) => {
    console.log('Rejestracja:', data);
    // tu w przyszłości wywołanie api.post('/auth/register', data)
  };

  return (
    <div>
      <h1>Rejestracja</h1>
      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
