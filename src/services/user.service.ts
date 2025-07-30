// src/services/user.service.ts
import type { Cliente, Vendedor } from "@/interfaces";

const API_URL = import.meta.env.VITE_API_URL;



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

// Servicio de login
export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Credenciales incorrectas");

  const data = await response.json();
  console.log("✅ Login response:", data);
  return data;
};

// Servicio para obtener el usuario autenticado usando el token
export const fetchMe = async (token: string) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("No se pudo obtener el usuario");

  return await response.json();
};



// Traer todos los vendedores desde el backend
export const getVendedores = async (): Promise<Vendedor[]> => {
  try {
    const response = await fetch(`${API_URL}/vendedores`);
    
    if (!response.ok) {
      console.warn("Usando vendedores locales");
      return JSON.parse(localStorage.getItem("vendedores") || "[]");
    }

    return await response.json(); // Debe devolver array de Vendedor[]
  } catch (error) {
    console.error("No se pudieron cargar los vendedores:", error);
    return [];
  }
};

// Guarda o actualiza un vendedor
export const saveVendedor = async (vendedor: Partial<Vendedor>): Promise<Vendedor> => {
  try {
    const response = await fetch(`${API_URL}/vendedores`, {
      method: vendedor.id ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vendedor),
    });

    if (!response.ok) throw new Error("No se pudo guardar");

    return await response.json();
  } catch (error) {
    console.error("Error al guardar vendedor", error);
    return { ...vendedor, id: Date.now().toString() } as Vendedor;
  }
};

// Elimina un vendedor
export const deleteVendedor = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/vendedores/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Error al eliminar vendedor", error);
    return false;
  }
};
