// src/components/orders/OrderStatusButton.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateOrderStatusToPaid } from "@/mocks/mock-orders";

interface Props {
  orderId: string;
  //isPaid: boolean;
  initialIsPaid: boolean;
  onStatusChange?: (newIsPaid: boolean) => void;
}

export const OrderStatusButton = ({
  orderId,
  initialIsPaid,
  onStatusChange,
}: Props) => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [isPaid, setIsPaid] = useState(initialIsPaid);

  const handleMarkAsPaid = () => {
    if (isPaid) return;

    // const updatedOrder = updateOrderStatusToPaid(orderId);
    // if (updatedOrder && updatedOrder.isPaid) {
    //   setIsPaid(true);
    //   setShowSuccessMessage(true);

    //   setTimeout(() => {
    //     setShowSuccessMessage(false);
    //   }, 3000);
    // }
    // Llama a tu función de mock
    updateOrderStatusToPaid(orderId); // Esta función ya actualiza el array global
    setIsPaid(true);
    onStatusChange?.(true); // ✅ Notifica al padre

    // Muestra mensaje por 3 segundos
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleMarkAsPaid}
        disabled={isPaid}
        className={`w-full py-3 px-4 rounded-md text-white ${
          isPaid
            ? "bg-green-500 cursor-not-allowed"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isPaid ? "Gestionada" : "Marcar como Gestionada"}
      </button>
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="absolute left-0 top-full mt-2 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md w-full max-w-xs animate-fadeIn">
          <p>Su pedido fue gestionado correctamente</p>
        </div>
      )}
    </div>
  );
};
