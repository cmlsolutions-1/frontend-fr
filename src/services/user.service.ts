// src/services/user.service.ts
import type { Cliente, Vendedor } from "@/interfaces";

const API_URL = "http://localhost:3000/api"; 

const mockedUsers = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "cliente@example.com",
    password: "cliente123",
    name: "Cliente Usuario",
    role: "cliente",
  },
  {
    id: "3",
    email: "vendedor@example.com",
    password: "vendedor123",
    name: "Vendedor Usuario",
    role: "vendedor",
  },
];


// esta es la interfaz de autenticación
interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Servicio de login
export const loginRequest = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) throw new Error("Credenciales incorrectas");

  return await response.json();

} catch (error) {
    console.warn("⚠️ Backend no disponible. Usando login simulado.");

    const foundUser = mockedUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!foundUser) {
    throw new Error("Credenciales inválidas (simuladas)");
  }

    // Datos quemados para realizar pruebas
    return {
      token: "mocked-token-dev",
      user: {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
    },
  };
  }
};
  

// (opcional) Servicio para obtener el usuario autenticado usando el token
export const fetchMe = async (token: string) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("No se pudo obtener el usuario");

  return await response.json();
};

// hasta aca va la autenticación



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
