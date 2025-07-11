// src/services/promotions.service.ts
import type { Promotion } from "@/interfaces/promotion.interface";

const API_URL = "http://localhost:3000/api/promotions";

export const getPromotions = async () => {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las promociones");
  }

  return await response.json();
};

export const createPromotion = async (promotionData: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    throw new Error("No se pudo crear la promoción");
  }

  return await response.json();
};

export const updatePromotion = async (id: string, promotionData: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(promotionData),
  });

  if (!response.ok) {
    throw new Error("No se pudo actualizar la promoción");
  }

  return await response.json();
};

export const deletePromotion = async (id: string) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar la promoción");
  }

  return await response.json();
};
