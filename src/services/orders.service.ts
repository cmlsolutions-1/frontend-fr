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

//Admin obtiene órdenes paginadas
interface GetOrdersByUserParams {
  page?: number;
  limit?: number;
}

export const getOrdersByUser = async ({
  page = 1,
  limit = 50,
}: GetOrdersByUserParams = {}): Promise<{
  ok: boolean;
  orders: Order[];
  total?: number;
  totalPages?: number;
}> => {
  try {
    const url = new URL(API_URL);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(), 
    });

    if (!response.ok) throw new Error("No se pudieron cargar las órdenes");

    const data = await response.json();

    if (Array.isArray(data)) {
      const start = (page - 1) * limit;

      return {
        ok: true,
        orders: data.slice(start, start + limit),
        total: data.length,
        totalPages: Math.max(1, Math.ceil(data.length / limit)),
      };
    }

    const orders = data?.orders || data?.data || data?.items || data?.results || [];
    const total = data?.total || data?.totalItems || data?.count || orders.length;
    const totalPages =
      data?.totalPages ||
      data?.pages ||
      data?.totalPage ||
      Math.max(1, Math.ceil(total / limit));

    return {
      ok: true,
      orders: Array.isArray(orders) ? orders : [],
      total,
      totalPages,
    };
  } catch (error) {
 
    return { ok: false, orders: [], total: 0, totalPages: 1 };
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
  salesPersonId: string,
  {
    page = 1,
    limit = 50,
  }: GetOrdersByUserParams = {}
): Promise<{
  ok: boolean;
  orders: Order[];
  total?: number;
  totalPages?: number;
}> => {
  try {
    if (!salesPersonId) {
      throw new Error("ID de vendedor no válido");
    }

    const url = new URL(`${API_URL}/getOrdersBySalesPerson/${salesPersonId}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      const start = (page - 1) * limit;

      return {
        ok: true,
        orders: data.slice(start, start + limit),
        total: data.length,
        totalPages: Math.max(1, Math.ceil(data.length / limit)),
      };
    }

    const orders = data?.orders || data?.data || data?.items || data?.results || [];
    const total = data?.total || data?.totalItems || data?.count || orders.length;
    const totalPages =
      data?.totalPages ||
      data?.pages ||
      data?.totalPage ||
      Math.max(1, Math.ceil(total / limit));

    return {
      ok: true,
      orders: Array.isArray(orders) ? orders : [],
      total,
      totalPages,
    };
  } catch (error) {

    return { ok: false, orders: [], total: 0, totalPages: 1 };
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

interface OrderStockContextItem {
  idProduct: string;
  reference?: string;
  stock?: number;
  quantity: number;
}

export const createOrder = async (
  payload: CreateOrderPayload,
  stockContext: OrderStockContextItem[] = []
): Promise<{ ok: boolean; order?: any; message?: string }> => {
  try {

    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!response.ok) {

      const rawMessage =
        data?.message ||
        text ||
        "No se pudo crear la orden.";

      const friendlyMessage = formatOrderError(rawMessage, response.status, stockContext);

      return {
        ok: false,
        message: friendlyMessage,
      };
    }

    const orderData = data ?? JSON.parse(text);

    return {
      ok: true,
      order: orderData,
      message: "Orden creada correctamente",
    };

  } catch (error) {

    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al crear la orden.",
    };
  }
};

const formatOrderError = (
  message: string,
  status: number,
  stockContext: OrderStockContextItem[] = []
) => {

  const msg = message.toLowerCase();

  // TOKEN
  if (status === 401 || msg.includes("token")) {
    return "Tu sesión expiró. Por favor inicia sesión nuevamente.";
  }

  // STOCK
  if (msg.includes("stock insuficiente")) {
    const stockDetailMessage = buildStockDetailMessage(stockContext);
    if (stockDetailMessage) return stockDetailMessage;

    const disponibleMatch = message.match(/Disponible:\s*(\d+)/i);
    const solicitadoMatch = message.match(/solicitado:\s*(\d+)/i);

    const disponible = disponibleMatch ? disponibleMatch[1] : null;
    const solicitado = solicitadoMatch ? solicitadoMatch[1] : null;

    if (disponible && solicitado) {
      return `Stock insuficiente para este producto. Disponible: ${disponible} unidades. Solicitaste: ${solicitado}. Por favor ajusta la cantidad.`;
    }

    return "Stock insuficiente para uno de los productos del carrito.";
  }

  // PRECIOS
  if (msg.includes("no se encontraron precios")) {
    return "Uno de los productos no tiene precio asignado para tu categoría. Contacta a tu vendedor.";
  }

  // ERROR GENERAL LIMPIO
  return message
    .replace(/^error\s*\d+:/i, "")
    .replace(/^\{.*"message":"/i, "")
    .replace(/"\s*,?\s*"statuscode".*\}$/i, "")
    .replace(/error al crear la orden:/i, "")
    .trim();
};

const buildStockDetailMessage = (items: OrderStockContextItem[]) => {
  if (items.length === 0) return "";

  const productsWithInsufficientStock = items.filter((item) => {
    const stock = Number(item.stock ?? 0);
    return stock <= 0 || item.quantity > stock;
  });

  const productsToShow =
    productsWithInsufficientStock.length > 0 ? productsWithInsufficientStock : items;

  const details = productsToShow.map((item) => {
    const stock = Number(item.stock ?? 0);
    const reference = item.reference || item.idProduct;

    if (stock <= 0) {
      return `ref ${reference} stock ${stock}, retirarlo`;
    }

    return `ref ${reference} stock ${stock} solicitaste ${item.quantity}, ajustarlo`;
  });

  const productLabel = details.length === 1 ? "el producto" : "los productos";

  return `Stock insuficiente para ${productLabel} de ${details.join("; ")}.`;
};

//ENPOIND PARA ANULAR ORDEN
export const cancelOrder = async (
  orderId: string,
  reasonCancellation: string
): Promise<{ ok: boolean; message?: string; order?: Order }> => {
  try {
    if (!orderId) throw new Error("ID de orden no válido");
    if (!reasonCancellation?.trim()) throw new Error("Debes ingresar un motivo");

    const response = await fetch(`${API_URL}/cancel`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        _id: orderId,
        reasonCancellation: reasonCancellation.trim(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return { ok: true, message: "Orden anulada correctamente", order: data };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Error al anular la orden",
    };
  }
};
