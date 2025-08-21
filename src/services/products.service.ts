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

export const getProductById = async (_id: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    // Ver logs para ver exactamente la respuesta del backend
    console.log("🔎 Fetching product:", `${API_URL}/products/${_id}`);
    console.log("📥 Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en la API:", errorText);
      throw new Error(`No se pudo cargar el producto. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Producto recibido:", data);
    return data;
  } catch (error) {
    console.error("⚠️ Error en getProductById:", error);
    throw error;
  }
};
