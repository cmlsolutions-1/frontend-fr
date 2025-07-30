import type { Cliente } from "@/interfaces/user.interface";

import { UpdateUserDto } from "@/interfaces/update-user";


const API_URL = import.meta.env.VITE_API_URL;



export const getClientsBySalesPerson = async (sellerId: string): Promise<Cliente[]> => {
  try {
    const res = await fetch(`${API_URL}/users/clientsBySalesPerson/${sellerId}`);
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener clientes (${res.status})`);
    }
    const data = await res.json();
    console.log("Respuesta del backend:", data);
    // Asegurarse de que devuelve un array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    // Relanzar el error para que el componente pueda manejarlo
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error("Error desconocido al obtener clientes.");
    }
    // O devuelve un array vacío si prefieres manejarlo silenciosamente
    // return [];
  }
};


