// src/services/checkout.service.ts
import type { Order } from "@/interfaces/order.interface";

const API_URL = import.meta.env.VITE_API_URL;


// Definir una interfaz para los productos que se enviarán en la orden
// Ajusta los nombres de los campos según lo que espere tu backend
export interface OrderProductItem {
  reference: string;     // La referencia del producto
  priceCategory: string; // El ID o nombre de la categoría de precio aplicable
  quantity: number;      // La cantidad solicitada de este producto específico

}

export interface CreateOrderPayload {
  clientId: string;             // El _id del cliente que realiza la orden
  productsToOrder: OrderProductItem[];

}


export const createOrder = async (payload: CreateOrderPayload) => {
  try {
    console.log("Enviando orden al backend:", JSON.stringify(payload, null, 2)); // Para depuración
    const response = await fetch(`${API_URL}/order/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      });

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      // Si la respuesta no es JSON válido (por ejemplo, 500 error)
      responseData = { message: `Error HTTP: ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      console.error("Error del backend al crear orden:", responseData);
      throw new Error(responseData.message || `No se pudo crear la orden (${response.status})`);
    }

    console.log("Orden creada exitosamente:", responseData);
    // Asumimos que el backend devuelve { ok: true, order: Order } o directamente la orden
    // Ajusta esto según la respuesta real de tu backend
    return {
      ok: true,
      order: responseData.order || responseData, // Manejar ambas posibilidades
    };
  } catch (error) {
    console.error("Error al crear la orden:", error);
    // Devolver un objeto de error consistente
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Hubo un problema al procesar tu pedido",
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