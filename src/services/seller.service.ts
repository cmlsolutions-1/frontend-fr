// src/services/seller.service.ts
import type { Vendedor } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

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
export const createVendedor = async (vendedor: Vendedor): Promise<Vendedor> => {
  // Asegúrate de que el vendedor tenga un ID
  const finalId = vendedor.id && vendedor.id.trim() !== "" 
    ? vendedor.id 
    : crypto.randomUUID();
    
  const payload = {
    id: finalId,
    name: vendedor.name,
    lastName: vendedor.lastName,
    email: vendedor.email.map(e => ({
      EmailAddres: e.EmailAddres,
      IsPrincipal: e.IsPrincipal,
    })),
    phone: vendedor.phone.map(p => ({
      NumberPhone: p.NumberPhone,
      Indicative: p.Indicative,
      IsPrincipal: p.IsPrincipal,
    })),
    addres: vendedor.addres,
    city: vendedor.city,
    password: vendedor.password,
    role: vendedor.role,
    priceCategory: vendedor.priceCategory,
    salesPerson: vendedor.salesPerson || undefined,
    clients: vendedor.clients || [],
  };

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al crear vendedor");
  }

  return await res.json();
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
