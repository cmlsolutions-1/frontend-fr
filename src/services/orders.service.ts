// src/services/orders.service.ts
import type { Cliente } from "@/interfaces/user.interface";
import type { Order } from "@/interfaces/order.interface";

const API_URL = `${import.meta.env.VITE_API_URL}/order`;

//Admin obtiene todas las órdenes

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


// 🔹 Client → obtiene órdenes de un cliente específico
export const getOrdersByClient = async (
  clientId: string // 
): Promise<{ ok: boolean; orders: Order[] }> => {
  try {
    console.log("🔍 Buscando órdenes para cliente ID:", clientId); // Debug
    if (!clientId) {
      throw new Error("ID de cliente no válido");
    }

    const response = await fetch(`${API_URL}/getOrdersByClient/${clientId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log("📥 Response status:", response.status); // Debug

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error del servidor:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Órdenes recibidas:", data); // Debug

    // ✅ Corrección: manejar tanto objetos individuales como arrays
    let ordersArray: Order[] = [];
    if (Array.isArray(data)) {
      ordersArray = data;
    } else if (data && typeof data === 'object') {
      // Si es un objeto individual, lo convertimos a array
      ordersArray = [data];
    }
    
    console.log("📋 Array de órdenes procesado:", ordersArray);
    return { ok: true, orders: ordersArray };
  } catch (error) {
    console.error("Error al obtener órdenes del cliente:", error);
    return { ok: false, orders: [] };
  }
};

// 🔹 SalesPerson → obtiene órdenes de clientes asociados a un vendedor
export const getOrdersBySalesPerson = async (
  salesPersonId: string
): Promise<{ ok: boolean; orders: Order[] }> => {
  try {
    if (!salesPersonId) {
      throw new Error("ID de vendedor no válido");
    }

    const response = await fetch(`${API_URL}/getOrdersBySalesPerson/${salesPersonId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Datos de vendedor recibidos:", data);
    
    // ✅ Manejar tanto objetos individuales como arrays
    let ordersArray: Order[] = [];
    if (Array.isArray(data)) {
      ordersArray = data;
    } else if (data && typeof data === 'object') {
      ordersArray = [data];
    }
    
    return { ok: true, orders: ordersArray };
  } catch (error) {
    console.error("Error al obtener órdenes del vendedor:", error);
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
