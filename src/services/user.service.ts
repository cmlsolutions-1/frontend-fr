// src/services/user.service.ts
import type { Cliente, Vendedor } from "@/interfaces";

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) {
      console.log("❌ No hay auth-storage en localStorage");
      return null;
    }
    
    const parsed = JSON.parse(authData);
    const token = parsed.state?.token || null;
    
    if (token) {
      console.log("✅ Token encontrado:", `${token.substring(0, 20)}...`);
    } else {
      console.log("❌ Token no encontrado en la estructura");
    }
    
    return token;
  } catch (error) {
    console.error("❌ Error al obtener token:", error);
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
  } else {
    console.warn("⚠️ No se encontró token para ruta protegida");
  }
  
  return headers;
};


// esta es la interfaz de autenticación
export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    id: string;
    name: string;
    lastName: string;
    role: string;
    email: {
      EmailAddres: string;
      IsPrincipal: boolean;
    }[];
    phone: {
      NumberPhone: string;
      IsPrincipal: boolean;
      Indicative: string;
    }[];
    addres: string[];
    city: string;
    password: string;
    emailVerified: boolean;
    emailValidated: boolean;
    clients: string[];
    priceCategory: string;
    state: string;
  };
}

// ✅ Servicio de login (SIN TOKEN - ruta pública)
export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  console.log("🚀 Iniciando login request:", { email });
  
  // ✅ NO USAR getAuthHeaders() - el login es ruta pública
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // ✅ Solo Content-Type, sin Authorization
    },
    body: JSON.stringify({ email, password }),
  });

  console.log("📥 Login response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Login error:", errorText);
    throw new Error("Credenciales incorrectas");
  }

  const data = await response.json();
  console.log("✅ Login response:", data);
  return data;
};

// ✅ Servicio para obtener el usuario autenticado usando el token
export const fetchMe = async (token: string) => {
  console.log("👤 Solicitando información de usuario con token");
  
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      "Content-Type": "application/json", // ✅ Agregar Content-Type
      "Authorization": `Bearer ${token}`,   // ✅ Usar token proporcionado
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`No se pudo obtener el usuario: ${errorText}`);
  }

  const data = await response.json();
  console.log("✅ Usuario obtenido:", data.name);
  return data;
};


