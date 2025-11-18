// src/components/ui/UserInfo.tsx
import React from "react";
import { useAuthStore } from "@/store/auth-store";
import { FaRegCircleUser } from "react-icons/fa6";

type Props = {
  mobile?: boolean;
};

export const UserInfo: React.FC<Props> = ({ mobile = false }) => {
  const user = useAuthStore((state) => state.user);

  if (mobile) {
    // MOBILE: icono + nombre pequeño debajo
    return (
      <div className="flex flex-col items-center justify-center">
        <FaRegCircleUser className="text-2xl text-[#4d4e4e]" />
        <span className="text-[11px] font-medium text-gray-700 mt-1 truncate max-w-[70px] text-center">
          {user?.name ? shorten(user.name) : "Usuario"}
        </span>
      </div>
    );
  }

  // DESKTOP: icono a la izquierda + nombre y rol
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center">
        <FaRegCircleUser className="text-xl text-[#505252] w-7 h-8" />
      </div>

      <div className="min-w-0">
        <p className="text-gray-700 text-sm truncate">
          Hola, <span className="font-bold">{user?.name || "Invitado"}</span>
        </p>

        <div className="bg-[#F2B318] text-white text-xs px-3 py-0.5 rounded-full mt-1 inline-block">
          {user?.role === "Admin" ? "Administrador" : user?.role === "SalesPerson" ? "Vendedor" : "Cliente"}
        </div>
      </div>
    </div>
  );
};

// helper para acortar nombres largos en mobile
function shorten(name: string) {
  if (name.length <= 10) return name;
  return name.split(" ")[0]; // devuelve el primer nombre
}
