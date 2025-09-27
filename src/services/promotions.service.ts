// src/services/promotions.service.ts

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  try {
    const authData = localStorage.getItem("auth-storage");
    if (!authData) return null;

    const parsed = JSON.parse(authData);
    return parsed.state?.token || parsed.token || null;
  } catch (error) {
    return null;
  }
};

const getAuthHeaders = (includeContentType: boolean = true) => {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const getPromotions = async () => {
  const response = await fetch(`${API_URL}/offer/`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las promociones");
  }

  return await response.json();
};

export const createPromotion = async (promotionData: any) => {
  const response = await fetch(`${API_URL}/offer`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(promotionData),
  });

  console.log("🚀 Status:", response.status);
  console.log("✅ Response OK:", response.ok);

  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("🔴 Error crudo del backend:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Error desconocido");
    } catch {
      throw new Error("Error del servidor: " + errorText);
    }
  }
  return await response.json();
};

export const updatePromotion = async (id: string, promotionData: any) => {
  const response = await fetch(`${API_URL}/offer/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(promotionData),
  });

    if (!response.ok) {
    // Capturar el error real del backend
    const errorText = await response.text();
    console.error("Error actualización:", errorText);
  try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || "Error desconocido");
    } catch {
      throw new Error("Error del servidor: " + errorText);
    }
  }
  
  return await response.json();
};

export const deletePromotion = async (id: string) => {
  // Asumiendo que el endpoint correcto es /offer/:id
  const response = await fetch(`${API_URL}/offer/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(false),
    // body: JSON.stringify({ estado: "Inactivo" }), // Esto no debería ir en DELETE
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("No se pudo eliminar la promoción: " + errorText);
  }

  return await response.json();
};

//para traer las promociones activas
export const getActivePromotions = async () => {
  const response = await fetch(`${API_URL}/offer`, {
    method: "GET",
    headers: getAuthHeaders(false),
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar las promociones");
  }

  const promotions = await response.json();
  
  // Filtrar promociones activas en el frontend
  const currentDate = new Date();
  const activePromotions = promotions.filter((promotion: any) => {
    return promotion.state === "Active" && 
           new Date(promotion.endDate) >= currentDate;
  });

  return activePromotions;
};
