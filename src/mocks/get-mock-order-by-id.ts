// src/mocks/get-mock-order-by-id.ts
import { mockOrders } from './mock-orders';

export const getMockOrderById = async (id: string) => {
  const order = mockOrders.find((order) => order.id === id);
  if (!order) {
    return {
      ok: false,
      message: 'Orden no encontrada',
    };
  }
  return {
    ok: true,
    order,
  };
};