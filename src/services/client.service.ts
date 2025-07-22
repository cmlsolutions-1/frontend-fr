// src/services/client.service.ts
import type { Cliente } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Obtiene clientes asociados al vendedor (salesperson).
 */
export const getClientsBySeller = async (sellerId: string): Promise<Cliente[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesperson/${sellerId}`);
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json();
  } catch (err) {
    console.warn("Usando clientes locales por error:", err);
    const stored = localStorage.getItem("clientes");
    return stored
      ? JSON.parse(stored).filter((c: Cliente) => c.salesPerson === sellerId)
      : [];
  }
};

/**
 * Crea un nuevo cliente usando el endpoint de registro.
 */
export const saveClient = async (cliente: Cliente): Promise<Cliente> => {
  // Construimos payload conforme a RegisterUserDto
  const payload = {
    id: cliente.id,
    name: cliente.name,
    lastName: cliente.lastName,
    email: cliente.email.map(e => ({
      EmailAddres: e.EmailAddres,
      IsPrincipal: e.IsPrincipal,
    })),
    phone: cliente.phone.map(p => ({
      NumberPhone: p.NumberPhone,
      Indicative: p.Indicative,
      IsPrincipal: p.IsPrincipal,
    })),
    addres: cliente.addres,
    city: cliente.city,
    password: cliente.password,
    role: "Client" as const,
    priceCategory: cliente.priceCategory,
    salesPerson: cliente.salesPerson, // id del vendedor asignado
    clients: [], // no aplica para cliente
  };

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error al guardar el cliente");
  }

  return await res.json();
};

/**
 * Marca un cliente como inactivo.
 */
export const deleteClient = async (id: string): Promise<void> => {
  const payload = { id, estado: "Inactive" };
  const res = await fetch(`${API_URL}/users/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Error eliminando el cliente");
  }
};
