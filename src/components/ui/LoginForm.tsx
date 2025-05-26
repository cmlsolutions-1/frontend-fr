import React, { useState } from 'react';
import { IoInformationOutline } from 'react-icons/io5';
import { useAuthStore } from '@/store/auth-mock-store';
import { Link, useNavigate } from 'react-router-dom'; // Importa useNavigate

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);

    if (!success) {
      setError(true);
    } else {
      console.log('Login exitoso, redirigiendo...');
      navigate('/homePage'); // Redirige a la página de inicio
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <label htmlFor="email">Correo electrónico</label>
      <input
        className="px-5 py-2 border bg-gray-200 rounded mb-5"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Contraseña</label>
      <input
        className="px-5 py-2 border bg-gray-200 rounded mb-5"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && (
        <div className="flex items-center mb-4 text-red-500 text-sm">
          <IoInformationOutline className="mr-2 h-5 w-5" />
          Credenciales incorrectas
        </div>
      )}

      <button type="submit" className="btn-primary mb-4">
        Ingresar
      </button>

      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-300" />
        <span className="mx-2 text-gray-600">O</span>
        <div className="flex-1 border-t border-gray-300" />
      </div>

      <Link to="/auth/new-account" className="btn-secondary text-center">
        Crear una nueva cuenta
      </Link>
    </form>
  );
};
