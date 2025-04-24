// src/components/LoginForm.jsx

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define the validation schema with Yup
const schema = yup.object({
  email: yup
    .string()
    .email('Nieprawidłowy email') // must be a valid email
    .required('Email wymagany'), // and is required
  password: yup
    .string()
    .min(6, 'Min. 6 znaków') // min length 6
    .required('Hasło wymagane'), // and is required
});

export default function LoginForm({ onSubmit }) {
  // Initialize React Hook Form with our Yup schema
  const {
    register, // function to register each input
    handleSubmit, // wraps our onSubmit to run validation
    formState: { errors, isSubmitting }, // form state info
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    // handleSubmit runs validation and then calls our onSubmit callback
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          type="email"
          placeholder="Email"
          {...register('email')} // register this input under "email"
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Hasło"
          {...register('password')} // register under "password"
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        Zaloguj
      </button>
    </form>
  );
}
