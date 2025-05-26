import { sleep } from "@/utils";

export const placeOrder = async (products: any[], address: any) => {
  // Simula un pequeño retraso
  await sleep(1000);

  if (!address || products.length === 0) {
    return {
      ok: false,
      message: 'Faltan datos para crear la orden.',
    };
  }

  // Devuelve una orden simulada
  return {
    ok: true,
    order: {
      id: 'mock-order-1234',
      products,
      address,
    },
  };
};
