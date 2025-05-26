// src/mocks/getMockProductBySlug.ts
import { mockProducts } from './mock-products';

export const getMockProductBySlug = async (slug: string) => {
  const product = mockProducts.find((p) => p.slug === slug);

  if (!product) return null;

  return {
    ...product,
    images: product.ProductImage.map((img) => img.url),
  };
};
