// src/services/orders.service.ts
import type { Cliente } from "@/interfaces/user.interface";
import type { Order } from "@/interfaces/order.interface";

const API_URL = `${import.meta.env.VITE_API_URL}/order`;

// Obtener el token
const getToken = () => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.token || null;
    } catch (error) {
      return null;
    }
  }
  return null;
};

// Función para obtener headers con token
const getAuthHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

//Admin obtiene todas las órdenes

export const getOrdersByUser = async (): Promise<{ ok: boolean; orders: Order[] }> => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "GET",
      headers: getAuthHeaders(), 
    });

    if (!response.ok) throw new Error("No se pudieron cargar las órdenes");

    const data = await response.json();

    return {
      ok: true,
      orders: Array.isArray(data) ? data : [],
    };
  } catch (error) {
 
    return { ok: false, orders: [] };
  }
};



export const getOrdersByClient = async (
  clientId: string // 
): Promise<{ ok: boolean; orders: Order[] }> => {
  try {

    if (!clientId) {
      throw new Error("ID de cliente no válido");
    }

    const response = await fetch(`${API_URL}/getOrdersByClient/${clientId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });


    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
  

    let ordersArray: Order[] = [];
    if (Array.isArray(data)) {
      ordersArray = data;
    } else if (data && typeof data === 'object') {
      // Si es un objeto individual, lo convertimos a array
      ordersArray = [data];
    }

    return { ok: true, orders: ordersArray };
  } catch (error) {

    return { ok: false, orders: [] };
  }
};

// SalesPerson → obtiene órdenes de clientes asociados a un vendedor
export const getOrdersBySalesPerson = async (
  salesPersonId: string
): Promise<{ ok: boolean; orders: Order[] }> => {
  try {
    if (!salesPersonId) {
      throw new Error("ID de vendedor no válido");
    }

    const response = await fetch(`${API_URL}/getOrdersBySalesPerson/${salesPersonId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
   
  
    let ordersArray: Order[] = [];
    if (Array.isArray(data)) {
      ordersArray = data;
    } else if (data && typeof data === 'object') {
      ordersArray = [data];
    }
    
    return { ok: true, orders: ordersArray };
  } catch (error) {

    return { ok: false, orders: [] };
  }
};


export const getOrderById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/getOrdersById/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Orden no encontrada");

    const data = await response.json();

    return { ok: true, order: data };
  } catch (error) {

    return { ok: false, order: null };
  }
};

// Actualizar estado de orden a pagada/gestionada
export const updateOrderStatusToPaid = async (
  orderId: string,
  syscafeOrder: string
): Promise<{ ok: boolean; message?: string }> => {
  try {
    if (!orderId || !syscafeOrder) {
      throw new Error("ID de orden no válido");
    }

    const response = await fetch(`${API_URL}/paid`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        _id: orderId,
        syscafeOrder,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    await response.json();

    
    return { ok: true, message: "Orden actualizada correctamente" };
  } catch (error) {

    return { ok: false, message: "Error al actualizar la orden" };
  }
};


// Crear una nueva orden
interface OrderItem {
  quantity: number;
  idProduct: string;
  priceCategory?: string;
}

interface CreateOrderPayload {
  idClient: string;
  orderItems: OrderItem[];
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<{ ok: boolean; order?: any; message?: string }> => {
  try {


    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });



    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    
    return { ok: true, order: data, message: "Orden creada correctamente" };
  } catch (error) {

    return { ok: false, message: error instanceof Error ? error.message : "Error al crear la orden" };
  }
};
