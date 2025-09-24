// src/interfaces/promotion.interface.ts

import type { ProductSummary } from './product.interface';

export interface Promotion {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  percentage: number;
  typePackage: "unidad" | "master" | "inner";
  products: ProductSummary[];
  minimumQuantity: number;
  startDate: string;
  endDate: string;
  isAll: boolean;
  state: "Activo" | "Inactivo" | "Active" | "Inactive"; 
  createdAt: string;
}

