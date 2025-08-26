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


// Función para buscar productos
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    // Si no hay query, retornar todos los productos
    if (!query.trim()) {
      return await getProducts();
    }

    // Obtener todos los productos
    const allProducts = await getProducts();
    
    // Filtrar localmente por referencia, detalle o código
    const filteredProducts = allProducts.filter((product) =>
      product.referencia?.toLowerCase().includes(query.toLowerCase()) ||
      product.detalle?.toLowerCase().includes(query.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(query.toLowerCase()) ||
      product._id?.toLowerCase().includes(query.toLowerCase())
    );

    return filteredProducts;
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
};