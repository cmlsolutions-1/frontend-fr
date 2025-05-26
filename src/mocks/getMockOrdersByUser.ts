// src/mocks/getMockOrdersByUser.ts
import { mockOrders } from './mock-orders';

export const getMockOrdersByUser = async () => {
  // Simular una orden filtrada por usuario logueado (en producción usarías userId)
  return {
    ok: true,
    orders: mockOrders,
  };
};
