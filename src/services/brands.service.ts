// src/services/brands.service.ts

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

export const getBrands = async () => {
  try {
    const response = await fetch(`${API_URL}/brands`, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar las marcas");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cargar marcas:", error);
    return []; // Devolver array vacío en caso de error
  }
};

export const getBrandById = async (brandId: string) => {
  try {
    const response = await fetch(`${API_URL}/brands/${brandId}`, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`No se pudo cargar la marca con ID: ${brandId}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al cargar marca:", error);
    return null;
  }
};