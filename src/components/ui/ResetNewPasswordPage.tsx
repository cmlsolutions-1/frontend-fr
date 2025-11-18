// src/components/ui/ResetNewPasswordPage.tsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

export const ResetNewPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get("email") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Aquí llamarás tu backend
    // await fetch("/auth/new-password", { ... })

    navigate("/");
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
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Crea tu nueva contraseña
          </h1>
          <p className="text-sm md:text-xl max-w-md">
            Para el correo: <strong>{email}</strong>
          </p>
        </div>
      </div>

      {/* Derecha - Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
            Nueva contraseña
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-12 h-12 bg-white border border-gray-300 rounded-full w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#F2B318] hover:bg-[#F4C048] text-white text-lg"
            >
              Guardar contraseña
            </button>

            <img src="/FR.png" className="max-w-full h-12 md:h-16 mx-auto" />
          </form>
        </div>
      </div>
    </div>
  );
};
