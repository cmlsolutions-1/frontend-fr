// src/components/ui/Navigation.tsx
import React from 'react';

export const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto">
        <ul className="flex">
          <li className="px-6 py-3 font-medium hover:bg-gray-100 cursor-pointer">INICIO</li>
          <li className="px-6 py-3 font-medium text-[#0099CC] border-b-2 border-[#0099CC] hover:bg-gray-100 cursor-pointer">
            NOVAVENTA
          </li>
          <li className="px-6 py-3 font-medium hover:bg-gray-100 cursor-pointer">MÁS PRESTIGIO</li>
          <li className="px-6 py-3 font-medium hover:bg-gray-100 cursor-pointer">MIS PREMIOS</li>
          <li className="px-6 py-3 font-medium hover:bg-gray-100 cursor-pointer">MI NEGOCIO</li>
          <li className="px-6 py-3 font-medium hover:bg-gray-100 cursor-pointer">MI PEDIDO</li>
        </ul>
      </div>
    </nav>
  );
};