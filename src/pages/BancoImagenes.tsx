// src/pages/BancoImagenes.tsx
import React from "react"; // Asegúrate de importar React
import ProductUpload from "@/components/product-upload"; // Importa tu nuevo componente

export default function BancoImagenes() {


  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 mt-[100px]">

      {/* Renderiza el componente de carga */}
      <ProductUpload />
    </div>
  );
}