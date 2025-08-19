// src/services/orders.service.ts
import type { Order } from "@/interfaces/order.interface";

const API_URL = `${import.meta.env.VITE_API_URL}/order`;

export const getOrdersByUser = async (): Promise<{ ok: boolean; orders: Order[] }> => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("No se pudieron cargar las órdenes");

    const data = await response.json();

    return {
      ok: true,
      orders: Array.isArray(data) ? data : [], // ✅ tu API devuelve directamente un array
    };
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return { ok: false, orders: [] };
  }
};

export const getOrderById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Orden no encontrada");

    const data = await response.json();

    return { ok: true, order: data };
  } catch (error) {
    console.error("Error al traer orden:", error);
    return { ok: false, order: null };
  }
};
