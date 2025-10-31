// src/components/orders/OrderStatusButton.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateOrderStatusToPaid } from "@/services/orders.service"; 
import { useAuthStore } from '@/store/auth-store';

interface Props {
  orderId: string;
  initialIsPaid: boolean;
  onStatusChange?: (newIsPaid: boolean) => void;
}

export const OrderStatusButton = ({
  orderId,
  initialIsPaid,
  onStatusChange,
}: Props) => {
  const { user } = useAuthStore();
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Verificar si el usuario puede gestionar ordenes
  const canManageOrders = user?.role === 'Admin' || user?.role === 'SalesPerson';

 const handleMarkAsPaid = async () => {
    if (isPaid || !canManageOrders || loading) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      
      const result = await updateOrderStatusToPaid(orderId);
      
      if (result.ok) {
        setIsPaid(true);
        onStatusChange?.(true);
        
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        setErrorMessage(result.message || "Error al actualizar la orden");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      setErrorMessage("Error de conexión");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ✅ No mostrar el botón si el usuario no tiene permisos
  if (!canManageOrders) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleMarkAsPaid}
        disabled={isPaid || loading}
        className={`w-full py-3 px-4 rounded-md text-white ${
          isPaid
            ? "bg-green-500 cursor-not-allowed"
            : loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading ? (
          "Actualizando..."
        ) : isPaid ? (
          "Gestionada"
        ) : (
          "Marcar como Gestionada"
        )}
      </button>
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="absolute left-0 top-full mt-2 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md w-full max-w-xs animate-fadeIn z-10">
          <p>Orden gestionada correctamente</p>
        </div>
      )}
    {/* Mensaje de error */}
      {errorMessage && (
        <div className="absolute left-0 top-full mt-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md w-full max-w-xs animate-fadeIn z-10">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
