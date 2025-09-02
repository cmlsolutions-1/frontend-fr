import type { Cliente } from "@/interfaces/user.interface";

import { UpdateUserDto } from "@/interfaces/update-user";


const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed.state?.token || parsed.token || null;
  } catch (error) {
    return null;
  }
};

// ✅ Función para obtener headers con token
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

export const getClientsBySalesPerson = async (sellerId: string): Promise<Cliente[]> => {
  try {
    console.log("🔍 Buscando clientes para vendedor ID:", sellerId);
    
    if (!sellerId) {
      throw new Error("ID de vendedor no válido");
    }

    const response = await fetch(`${API_URL}/users/clientsBySalesPerson/${sellerId}`, {
      method: "GET",
      headers: getAuthHeaders(), // ✅ Enviar token
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error del servidor:", errorText);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Clientes recibidos:", data.length);

    // ✅ Mapear los datos al formato del frontend
    return Array.isArray(data) 
      ? data.map((item: any) => ({
          ...item,
          emails: item.email || item.emails || [],
          phones: item.phone || item.phones || [],
          address: Array.isArray(item.address) ? item.address : [item.address || ""],
          city: item.cityId || item.city || "",
          state: item.state === "Active" ? "activo" : "inactivo",
        }))
      : [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};


