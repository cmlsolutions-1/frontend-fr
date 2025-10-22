// src/pages/BancoImagenes.tsx
import React from "react"; // Asegúrate de importar React
import ProductUpload from "@/components/product-upload"; // Importa tu nuevo componente

export default function BancoImagenes() {
  // Puedes mantener el estado aquí si necesitas manejar algo específico en el nivel de página
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 mt-[100px]">
      {/* Header (opcional, puedes mantenerlo o quitarlo si el componente ProductUpload lo tiene) */}
      {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Banco de Imágenes</h1>
          <p className="text-sm text-gray-500">
            Carga las imagenes de los productos para su uso en el sistema
          </p>
        </div>
      </div> */}

      {/* Renderiza el componente de carga */}
      <ProductUpload />
    </div>
  );
}