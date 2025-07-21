// src/services/client.service.ts
import type { Cliente, Vendedor } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const getClientsBySeller = async (sellerId: string): Promise<Cliente[]> => {
  try {
    const response = await fetch(`${API_URL}/users/salesperson/${sellerId}`);

    if (!response.ok) {
      console.warn("Usando clientes locales");
      const storedClientes = localStorage.getItem("clientes");
      return storedClientes ? JSON.parse(storedClientes).filter(
        (c: Cliente) => c.vendedorId === sellerId
      ) : [];
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    const storedClientes = localStorage.getItem("clientes");
    return storedClientes ? JSON.parse(storedClientes).filter(
      (c: Cliente) => c.vendedorId === sellerId
    ) : [];
  }
};

export const saveClient = async (cliente: Cliente): Promise<Cliente> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) throw new Error("Error guardando el cliente");

  return await response.json();
};

export const deleteClient = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/delete`, {
    method: "post",
    body: JSON.stringify({ id, estado: "inactivo" }),
  });

  if (!response.ok) throw new Error("Error eliminando el cliente");
};