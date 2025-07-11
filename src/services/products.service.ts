// src/services/products.service.ts
import type { Product } from "@/interfaces/product.interface";

const API_URL = "http://localhost:3000/api/products"; // Cambia por la URL real del backend

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

  return await response.json(); // Asegúrate de que el backend devuelva { items, totalPages }
};