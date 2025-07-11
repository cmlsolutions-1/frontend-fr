// src/components/ui/UserInfo.tsx
import React from 'react';
import { useAuthStore } from '@/store/auth-store';

export const UserInfo = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="bg-white ">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-[#dbe9f0] rounded-full flex items-center justify-center mr-3 border border-[#0099CC]">
            {/* Aquí puedes usar un icono de usuario si lo tienes */}
            <span className="text-xl font-bold text-[#0099CC]">U</span>
          </div>
          <div>
            <p className="text-gray-700 text-sm">
              Hola, <span className="font-bold">{user?.name || 'Invitado'}</span>
            </p>
            <div className="bg-[#F2B318] text-white text-xs px-3 py-0.5 rounded-full mt-1">
              {user?.role === 'admin' ? 'Administrador' : 'Empresario'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};