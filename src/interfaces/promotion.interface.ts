// src/interfaces/promotion.interface.ts
export interface Promotion {
  id: string;
  name: string;
  description: string;
  discountPercentage: number;
  typePackage: 'unidad' | 'master';
  productIds: string[];
  minimunQuantity: number;
  productTypes: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}