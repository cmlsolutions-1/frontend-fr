//src/components/ui/LoginForm.tsx

import React, { useState, useEffect  } from "react";
import { IoInformationOutline } from "react-icons/io5";
import { useAuthStore } from "@/store/auth-store";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock } from "lucide-react";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate(); // Inicializa useNavigate

  

  const handleSubmit = async  (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      
      const success = await login(email, password);

      if (!success) {
        setError("Credenciales incorrectas");
      } else {
      
        setTimeout(() => {
          navigate("/homePage");
        }, 100);
      }
    } catch (err) {
      setError("Error al iniciar sesión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
      {/* Imagen izquierda */}
      <div className="relative w-full md:w-3/4 h-64 md:h-auto">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/imgsLogin/3.jpg)" }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-5" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-16 text-white text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">¡Bienvenido!</h1>
          <p className="text-sm md:text-xl max-w-md">
            Inicia sesión para acceder a tu cuenta.
          </p>
        </div>
      </div>

      {/* Derecha - Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
              Iniciar Sesión
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="pl-10 h-12 bg-white border border-gray-300 rounded-full w-full"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="pl-10 h-12 bg-white border border-gray-300 rounded-full w-full"
                required
              />
            </div>

            {error && (
              <div className="flex items-center text-sm text-red-500">
                <IoInformationOutline className="mr-2 h-5 w-5" />
                Credenciales incorrectas
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-full text-lg font-medium transition-colors ${
                loading
                  ? "bg-[#F4C048] cursor-not-allowed"
                  : "bg-[#F2B318] hover:bg-[#F4C048] text-white"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center text-white">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                <span className="text-white">Ingresar</span>
              )}
            </button>

            {/* Logo de la empresa */}
            <div className="mt-4 text-center">
              <img
                src="/FR.png" // Reemplaza con la ruta correcta del logo
                alt="Logo Emrapess"
                className="max-w-full h-12 md:h-16 mx-auto"
              />
            </div>

            {/* <div className="text-center">
              <span className="text-gray-600">¿Nuevo aquí? </span>
              <Link
                to="/auth/new-account"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Crear una cuenta
              </Link>
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
};
