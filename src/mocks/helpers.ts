import { mockProducts } from './mock-products';
import { mockCategories } from './mock-categories';

export const getMockCategories = async () => {
  return mockCategories;
};

export const getMockProductBySlug = async (slug: string) => {
  return mockProducts.find((p) => p.slug === slug) ?? null;
};