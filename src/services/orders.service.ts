// src/services/orders.service.ts
import type { Order } from "@/interfaces/order.interface";

const API_URL = "http://localhost:3000/api/orders";


export const getOrdersByUser = async (): Promise<{ ok: boolean; orders: Order[] }> => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error("No se pudieron cargar las órdenes");
      }
  
      const data = await response.json();
      
      return {
        ok: true,
        orders: data.items || [],
      };
    } catch (error) {
      console.error("Error al obtener órdenes:", error);
      return {
        ok: false,
        orders: [],
      };
    }
  };

export const createOrder = async (productsToOrder: any[], address: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productsToOrder,
      address,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la orden");
  }

  return await response.json();
};

export const getOrderById = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error("Orden no encontrada");
  }

  return await response.json();
};