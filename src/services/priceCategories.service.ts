// src/services/priceCategories.service.ts
export interface PriceCategory {
  _id: string;
  code: string;
  name: string;
  id: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const getPriceCategories = async (): Promise<PriceCategory[]> => {
  const response = await fetch(`${API_URL}/price-categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) throw new Error("No se pudieron cargar las categorías de precios");

  return await response.json();
};
