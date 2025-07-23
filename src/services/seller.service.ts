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

    // Mapear los datos manteniendo la estructura original
    return data.map(
      (item: any): Vendedor => ({
        id: item.id,
        name: item.name,
        lastName: item.lastName,
        password: "", // Campo requerido pero no viene del backend
        emails: item.emails || [], // Mantener estructura original
        phones: item.phones || [], // Mantener estructura original
        address: Array.isArray(item.address) ? item.address : [],
        city: item.cityId,
        role: item.role,
        priceCategory: "", // No viene en el backend
        state: item.state === "Active" ? "activo" : "inactivo",
        salesPerson: "", // Asumiendo que no aplica aquí
        clients: item.extra?.clients || [],
      })
    );
  } catch (error) {
    console.error("Fallo al obtener vendedores:", error);
    return [];
  }
};

// Crear un vendedor
export const createVendedor = async (vendedor: Vendedor): Promise<Vendedor> => {
  // Validación exhaustiva del email
  if (
    !vendedor.emails ||
    !Array.isArray(vendedor.emails) ||
    vendedor.emails.length === 0 ||
    !vendedor.emails[0]?.emailAddress?.trim()
  ) {
    console.error("Datos de email inválidos:", vendedor.emails);
    throw new Error("Debe proporcionar al menos un email válido");
  }

  // Estructura EXACTA que espera el backend
  const payload = {
    id: vendedor.id,
    name: vendedor.name.trim(),
    lastName: vendedor.lastName.trim(),
    email: [
      {
        emailAddres: vendedor.emails[0].emailAddress.trim(),
        isPrincipal: true,
      },
    ],
    phone: [
      {
        numberPhone: vendedor.phones[0]?.numberPhone?.replace(/\D/g, "") || "",
        indicative: vendedor.phones[0]?.indicative || "+57",
        isPrincipal: true,
      },
    ],
    address: [vendedor.address[0] || ""],
    city: vendedor.city,
    password: vendedor.password,
    role: vendedor.role,
    state: "Active",
    priceCategory: vendedor.priceCategory || "",
  };

  console.log("Payload final para el backend:", payload);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json();

    if (!res.ok) {
      console.error("Error detallado del backend:", responseData);
      throw new Error(responseData.message || "Error al crear vendedor");
    }

    // Mapear la respuesta al formato del frontend
    return {
      ...responseData,
      emails:
        responseData.email?.map((e: any) => ({
          emailAddress: e.emailAddres,
          isPrincipal: e.isPrincipal,
        })) || [],
      phones:
        responseData.phone?.map((p: any) => ({
          numberPhone: p.numberPhone,
          indicative: p.indicative,
          isPrincipal: p.isPrincipal,
        })) || [],
      address: Array.isArray(responseData.address)
        ? responseData.address
        : [responseData.address],
      city: responseData.cityId || responseData.city,
      state: responseData.state === "Active" ? "activo" : "inactivo",
    };
  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw new Error("No se pudo conectar con el servidor");
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
