// src/mocks/getMockProductBySlug.ts
import { mockProducts } from './mock-products';

export const getMockProductBySlug = async (slug: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simula carga

  const product = mockProducts.find((p) => p.slug === slug);

  //if (!product) return null;

  /* return {
    ...product,
    images: [product.ProductImage[0]?.url || "default.jpg"],
  }; */
  return product; 
};
