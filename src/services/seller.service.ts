// src/services/seller.service.ts
import type { Vendedor } from "@/interfaces/user.interface";

const API_URL = "http://localhost:3000/api/vendedores";

// Obtener todos los vendedores
export const getVendedores = async (): Promise<Vendedor[]> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener vendedores");
    return await res.json();
  } catch (error) {
    console.error("Fallo al obtener vendedores:", error);
    return JSON.parse(localStorage.getItem("vendedores") || "[]");
  }
};

// Crear un vendedor
export const createVendedor = async (
  data: Partial<Vendedor>
): Promise<Vendedor> => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al crear vendedor");
    return await res.json();
  } catch (error) {
    console.error("Error creando vendedor:", error);
    throw error;
  }
};

// Actualizar un vendedor
export const updateVendedor = async (
  id: string,
  data: Partial<Vendedor>
): Promise<Vendedor> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al actualizar vendedor");
    return await res.json();
  } catch (error) {
    console.error("Error actualizando vendedor:", error);
    throw error;
  }
};

// Eliminar un vendedor
export const deleteVendedor = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch (error) {
    console.error("Error eliminando vendedor:", error);
    return false;
  }
};
