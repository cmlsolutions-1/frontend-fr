// src/services/checkout.service.ts
import type { Order } from "@/interfaces/order.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const createOrder = async (productsToOrder: any[], address: any) => {
  try {
    const response = await fetch(`${API_URL}/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productsToOrder,
        address,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "No se pudo crear la orden");
    }

    return await response.json(); // Debe devolver { ok: true, order: Order }
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return {
      ok: false,
      message: "Hubo un problema al procesar tu pedido",
    };
  }
};

export const getOrderById = async (id: string): Promise<{ ok: boolean; order?: Order }> => {
  try {
    const response = await fetch(`${API_URL}/order/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Orden no encontrada");
    }

    const data = await response.json();

    return {
      ok: true,
      order: data.order,
    };
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    return {
      ok: false,
      //message: "Orden no encontrada",
    };
  }
};