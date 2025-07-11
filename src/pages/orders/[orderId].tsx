// src/pages/orders/[orderId].tsx
import React from "react";
import { useParams } from "react-router-dom";

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">Confirmación de Orden</h1>
      <p>Gracias por tu compra. Tu orden ha sido procesada.</p>
      <p>ID de la orden: {orderId}</p>
    </div>
  );
};