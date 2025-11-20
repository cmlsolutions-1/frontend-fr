// src/components/ui/ResetCodePage.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { validateResetPasswordCode } from "@/services/seller.service";


export const ResetCodePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get("email") || "";

  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const ok = await validateResetPasswordCode(email, code);

  if (!ok) {
    alert("Código incorrecto o expirado.");
    return;
  }

  navigate(`/auth/new-password?email=${email}&code=${code}`);
};

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-white">
      
      {/* Imagen izquierda (reutilizada del LoginReset) */}
      <div className="relative w-full md:w-3/4 h-64 md:h-auto">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/imgsLogin/3.jpg)" }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-5" />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 md:px-16 text-white text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Ingresa el código
          </h1>
          <p className="text-sm md:text-xl max-w-md">
            Te enviamos un código al correo: <strong>{email}</strong>
          </p>
        </div>
      </div>

      {/* Formulario derecha */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
            Verificación
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Código de 6 dígitos"
              className="w-full h-12 bg-white border border-gray-300 rounded-full text-center tracking-widest"
            />

            <button
              type="submit"
              className="w-full h-12 rounded-full bg-[#F2B318] hover:bg-[#F4C048] text-white text-lg"
            >
              Validar código
            </button>
          </form>

          <img src="/FR.png" className="max-w-full h-12 md:h-16 mx-auto" />
        </div>
      </div>
    </div>
  );
};
