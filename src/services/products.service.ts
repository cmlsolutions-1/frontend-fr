// src/services/products.service.ts
import type { Product } from "@/interfaces/product.interface";

const API_URL = import.meta.env.VITE_API_URL;


// Obtener productos (sin paginación por ahora)
export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los productos");
  }

  return await response.json(); // ← directo, sin mapear
};