// src/services/seller.service.ts
import type { Vendedor } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

//obtener todos los vendedores
export const getVendedores = async (): Promise<Vendedor[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesPerson`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) throw new Error("Error al obtener vendedores");

    const data = await res.json();

    // Mapear los datos del backend al modelo del frontend
    return data.map((item: any): Vendedor => ({
      id: item.id,
      name: item.name,
      lastName: item.lastName,
      password: "", // ⚠️ No viene del backend, pero es obligatorio en la interfaz
      email: item.emails?.map((e: any) => ({
        EmailAddres: e.emailAddress,
        IsPrincipal: e.isPrincipal,
      })) || [],
      phone: item.phones?.map((p: any) => ({
        NumberPhone: p.numberPhone,
        Indicative: p.indicative,
        IsPrincipal: p.isPrincipal,
      })) || [],
      addres: Array.isArray(item.address) ? item.address : [],
      city: item.cityId,
      role: item.role,
      priceCategory: "", // ⚠️ No viene en el backend
      estado: item.state === "Active" ? "activo" : "inactivo",
      salesPerson: "", // Asumiendo que no aplica aquí
      clients: item.extra?.clients || [],
    }));
  } catch (error) {
    console.error("Fallo al obtener vendedores:", error);
    return [];
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
