import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup
  .object({
    name: yup.string().required('Imię wymagane'),
    email: yup.string().email('Nieprawidłowy email').required('Email wymagany'),
    password: yup.string().min(6, 'Min. 6 znaków').required('Hasło wymagane'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Hasła muszą być takie same')
      .required('Potwierdź hasło'),
  })
  .required();

export default function RegisterForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input placeholder="Imię" {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <input placeholder="Email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <input type="password" placeholder="Hasło" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      <div>
        <input type="password" placeholder="Potwierdź hasło" {...register('confirmPassword')} />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}>
        Zarejestruj
      </button>
    </form>
  );
}
