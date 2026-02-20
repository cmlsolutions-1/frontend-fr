// src/components/orders/OrderStatusButton.tsx
import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateOrderStatusToPaid } from "@/services/orders.service"; 
import { useAuthStore } from '@/store/auth-store';

interface Props {
  orderId: string;
  initialIsPaid: boolean;
  isCanceled?: boolean;
  syscafeOrder?: string | null;
  onStatusChange?: (newIsPaid: boolean, syscafeOrder?: string) => void;
}

export const OrderStatusButton = ({
  orderId,
  initialIsPaid,
  isCanceled,
  syscafeOrder,
  onStatusChange,
}: Props) => {
  const { user } = useAuthStore();
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [isPaid, setIsPaid] = useState(initialIsPaid);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [externalOrderName, setExternalOrderName] = useState(
    syscafeOrder ?? ""
  );

  useEffect(() => {
    if (syscafeOrder) {
      setExternalOrderName(syscafeOrder);
    }
  }, [syscafeOrder]);

  // Verificar si el usuario puede gestionar ordenes
  const canManageOrders = user?.role === 'Admin' || user?.role === 'SalesPerson';
  

  const handleMarkAsPaid = async () => {
    if (isCanceled) {
      setErrorMessage("Esta orden está anulada y no puede gestionarse");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    if (isPaid || !canManageOrders || loading) return;
  
    if (!externalOrderName.trim()) {
      setErrorMessage("Debes ingresar el número de pedido Syscafe");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
  
    try {
      setLoading(true);
      setErrorMessage(null);
  
      const result = await updateOrderStatusToPaid(
        orderId,
        externalOrderName
      );
  
      if (result.ok) {
        setIsPaid(true);
        onStatusChange?.(true, externalOrderName);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        setErrorMessage(result.message || "Error al actualizar la orden");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch {
      setErrorMessage("Error de conexión");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };
  

  // No mostrar el botón si el usuario no tiene permisos
  if (!canManageOrders) {
    return null;
  }

  return (
    <div className="relative">
        <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del pedido Syscafe
        </label>

        <input
          type="text"
          value={externalOrderName}
          onChange={(e) => setExternalOrderName(e.target.value)}
          disabled={isPaid || loading || !!isCanceled}
          placeholder="Ej: PE-00021"
          className={`w-full px-3 py-2 rounded-md border text-sm
            ${
              isPaid
                ? "bg-gray-100 border-gray-300 cursor-not-allowed text-gray-600"
                : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
        />

        {isPaid && (
          <p className="text-xs text-gray-500 mt-1">
            Este pedido ya fue gestionado y no puede editarse
          </p>
          
        )}

        {isCanceled && (
          <p className="text-xs text-orange-700 mt-1">
            Este pedido fue anulado y no puede gestionarse
          </p>
        )}
      </div>

      <button
        onClick={handleMarkAsPaid}
        disabled={isPaid || loading || !!isCanceled}
        className={`w-full py-3 px-4 rounded-md text-white ${
          isCanceled
            ? "bg-orange-500 cursor-not-allowed"
            : isPaid
            ? "bg-green-500 cursor-not-allowed"
            : loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {loading
        ? "Actualizando..."
        : isCanceled
        ? "Anulada"
        : isPaid
        ? "Gestionada"
        : "Marcar como Gestionada"}
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
