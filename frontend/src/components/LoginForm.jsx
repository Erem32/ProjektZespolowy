import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Nieprawidłowy email').required('Email wymagany'),
  password: yup.string().min(6, 'Min. 6 znaków').required('Hasło wymagane'),
});

export default function LoginForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input type="email" placeholder="Email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <input type="password" placeholder="Hasło" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        Zaloguj
      </button>
    </form>
  );
}
