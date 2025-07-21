// src/services/products.service.ts
import type { Product } from "@/interfaces/product.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = async (page: number = 1, limit: number = 12) => {
  const response = await fetch(`${API_URL}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return await response.json(); 
};