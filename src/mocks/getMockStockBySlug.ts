// src/mocks/getMockStockBySlug.ts

import { mockProducts } from "./mock-products"; // Asegúrate de que esto apunte a tu mock de productos

export const getMockStockBySlug = async (slug: string): Promise<number> => {
  const product = mockProducts.find((p) => p.slug === slug);
  return product?.inStock ?? 0;
};
