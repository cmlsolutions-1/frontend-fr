// src/mocks/getMockOrdersByUser.ts
import { mockOrders } from './mock-orders';


export const getMockOrdersByUser = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simula carga
  const userHasSession = true; // Cambia esto según sesión

  if (!userHasSession) {
    return { ok: false, orders: [] };
  }

  return { ok: true, orders: mockOrders };
};