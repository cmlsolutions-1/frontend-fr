//src/services/client.service.ts

import type { Cliente } from "@/interfaces/user.interface";

import { UpdateUserDto } from "@/interfaces/update-user";

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) return null;
    
    const parsed = JSON.parse(authData);
    return parsed.state?.token || parsed.token || null;
  } catch (error) {
    return null;
  }
};

// Función para obtener headers con token
const getAuthHeaders = (includeContentType: boolean = true) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

export const saveClient = async (cliente: Cliente): Promise<Cliente> => {
  // Validaciones obligatorias
  // Validar email primero

  const emailPrincipal = cliente.emails?.[0]?.EmailAddres;
  if (!emailPrincipal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrincipal)) {
    throw new Error("Debe proporcionar un email válido");
  }

  if (!cliente.salesPersonId) {
    throw new Error("Debe asignar un vendedor al cliente");
  }

  if (!cliente.emails?.[0]?.EmailAddres) {
    throw new Error("El email es requerido");
  }

  if (!cliente.phones?.[0]?.NumberPhone) {
    throw new Error("El teléfono es requerido");
  }

  // Estructura EXACTA que espera el backend
  const payload = {
    id: cliente.id,
    name: cliente.name.trim(),
    lastName: cliente.lastName.trim(),
    email: [
      {
        EmailAddres: cliente.emails[0].EmailAddres.trim(),
        IsPrincipal: true,
      },
    ],
    phone: [
      {
        NumberPhone: cliente.phones[0].NumberPhone.replace(/\D/g, ""),
        Indicative: cliente.phones[0].Indicative || "+57",
        IsPrincipal: true,
      },
    ],
    address: cliente.address || [""],
    city: cliente.city,
    password: cliente.password,
    role: "Client",
    priceCategory: cliente.priceCategoryId,
    salesPerson: cliente.salesPersonId, // ID del vendedor asociado

  };


  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      responseData = {
        message: `Error HTTP: ${response.status} ${response.statusText}`,
      };
    }

    if (!response.ok) {

      throw new Error(
        responseData.message ||
          `Error al registrar el cliente (${response.status})`
      );
    }

    let createdClientData;
    if (
      responseData &&
      typeof responseData === "object" &&
      "id" in responseData
    ) {
      // Si la respuesta es el cliente directamente
      createdClientData = responseData;
    } else if (
      responseData &&
      typeof responseData === "object" &&
      responseData.user &&
      typeof responseData.user === "object" &&
      "id" in responseData.user
    ) {
      // Si la respuesta es { user: Cliente }
      createdClientData = responseData.user;
    } else {

      createdClientData = {
        ...cliente, // Conserva datos locales
        id: responseData?.id || cliente.id || crypto.randomUUID(), // Usa ID del backend si existe
        // Mapea otros campos si es necesario
      };
    }

    const mappedState =
      createdClientData.state === "Active"
        ? "activo"
        : createdClientData.state === "Inactive"
        ? "inactivo"
        : createdClientData.state || "activo"; // Valor por defecto

    const createdClient: Cliente = {
      ...createdClientData,
      state: mappedState, // Asegura el formato del estado
      // Si necesitas mapear otros campos específicos del backend al frontend, hazlo aquí
    };


    return createdClient;
  } catch (error) {
    // Es mejor relanzar errores de red/HTTP como están
    if (error instanceof TypeError && error.message.includes("fetch")) {

      throw new Error(
        "Error de conexión. Verifique su red e intente nuevamente."
      );
    }

    // Si ya es un Error con mensaje útil, relánzalo. Si no, crea uno.
    if (error instanceof Error) {
      throw error; // Relanzar el error original
    } else {
      throw new Error(
        "No se pudo registrar el cliente. Por favor intente nuevamente."
      );
    }
  }
};

// src/services/client.service.ts
export const updateClient = async (cliente: Cliente): Promise<Cliente> => {

  const clientIdToUpdate = cliente._id || cliente.id;
  if (!clientIdToUpdate) {
    throw new Error(
      "El ID (_id o id) del cliente es requerido para la actualización."
    );
  }
  const emailPrincipal = cliente.emails?.[0]?.EmailAddres;
  if (!emailPrincipal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrincipal)) {
    throw new Error("Debe proporcionar un email válido");
  }
  if (!cliente.salesPersonId) {
    throw new Error("Debe asignar un vendedor al cliente");
  }
  if (!cliente.phones?.[0]?.NumberPhone) {
    throw new Error("El teléfono es requerido");
  }

  // --- Construcción DIRECTA del payload para la actualización usando _id ---
  const payloadToSend: any = {
    // Usar _id como el identificador principal para MongoDB
    _id: clientIdToUpdate, // <-- Cambio clave aquí
  };

  // Añadir solo los campos que tienen valor
  if (cliente.name?.trim()) payloadToSend.name = cliente.name.trim();
  if (cliente.lastName?.trim())
    payloadToSend.lastName = cliente.lastName.trim();

  if (cliente.emails && cliente.emails.length > 0) {
    payloadToSend.email = cliente.emails.map((e) => ({
      EmailAddres: e.EmailAddres?.trim(),
      IsPrincipal: e.IsPrincipal,
    }));
  }

  if (cliente.phones && cliente.phones.length > 0) {
    payloadToSend.phone = cliente.phones.map((p) => ({
      NumberPhone: p.NumberPhone?.replace(/\D/g, ""),
      Indicative: p.Indicative,
      IsPrincipal: p.IsPrincipal,
    }));
  }

  if (cliente.address && cliente.address.length > 0) {
    payloadToSend.address = cliente.address;
  }

  if (cliente.city) payloadToSend.city = cliente.city;
  if (cliente.priceCategoryId)
    payloadToSend.priceCategory = cliente.priceCategoryId;

 
  if (cliente.id) payloadToSend.id = cliente.id; // <-- Incluir el ID (cedula) para actualizarlo
  if (cliente.password) payloadToSend.password = cliente.password; // <-- Incluir la contraseña para actualizarla



  payloadToSend.salesPerson = cliente.salesPersonId;



  try {

    const response = await fetch(`${API_URL}/users/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payloadToSend),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      responseData = {
        message: `Error HTTP: ${response.status} ${response.statusText}`,
      };
    }

    if (!response.ok) {

      throw new Error(
        responseData.message ||
          `Error al actualizar el cliente (${response.status})`
      );
    }

    // --- Manejo de la respuesta del backend ---
    let updatedClientData: any = {};
    if (responseData && typeof responseData === "object") {
      if (
        "user" in responseData &&
        responseData.user &&
        typeof responseData.user === "object" &&
        "id" in responseData.user
      ) {
        // Si la respuesta es { user: ..., token: ... }
        updatedClientData = responseData.user;
      } else if ("id" in responseData) {
        // Si la respuesta es el cliente directamente
        updatedClientData = responseData;
      } else {
        updatedClientData = { ...payloadToSend, ...responseData }; // Mezclar
      }
    }

    // Mapear el estado del backend al formato del frontend si es necesario
    const mappedState =
      updatedClientData.state === "Active"
        ? "activo"
        : updatedClientData.state === "Inactive"
        ? "inactivo"
        : updatedClientData.state || cliente.state || "activo"; // Fallback

    // --- Crear el objeto Cliente final para devolver al frontend ---
    const updatedClient: Cliente = {
      // Priorizar _id e id del backend, fallback a los del cliente original
      _id: updatedClientData._id || cliente._id,
      id: updatedClientData.id || cliente.id,
      name: updatedClientData.name ?? cliente.name,
      lastName: updatedClientData.lastName ?? cliente.lastName,
      emails:
        updatedClientData.email || updatedClientData.emails || cliente.emails,
      phones:
        updatedClientData.phone || updatedClientData.phones || cliente.phones,
      address: updatedClientData.address || cliente.address,
      city: updatedClientData.city || cliente.city,
      password: "", // Nunca devolver la contraseña
      role: updatedClientData.role || cliente.role || "Client",
      priceCategoryId: updatedClientData.priceCategory || cliente.priceCategoryId,
      // MUY IMPORTANTE: El backend responde con 'idSalesPerson', mapearlo a 'salesPerson' del frontend
      salesPersonId:
        updatedClientData.salesPerson ||
        updatedClientData.salesPerson ||
        cliente.salesPersonId,
      state: mappedState,
    };


    return updatedClient;
  } catch (error) {

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Error de conexión. Verifique su red e intente nuevamente."
      );
    }
    if (error instanceof Error) {
      throw error; // Relanzar errores con mensaje
    } else {
      throw new Error(
        "No se pudo actualizar el cliente. Por favor intente nuevamente."
      );
    }
  }
};

export const getClientsBySeller = async (
  sellerId: string
): Promise<Cliente[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesperson/${sellerId}/clients`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al obtener clientes (${res.status})`
      );
    }
    const data = await res.json();
    // Asegurarse de que devuelve un array
    return Array.isArray(data) ? data : [];
  } catch (error) {

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


//traer un cliente por id
export const getClientById = async (clientId: string): Promise<Cliente | null> => {
  try {
    const response = await fetch(`${API_URL}/users/getById/${clientId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
      
     if (!response.ok) throw new Error(`Error ${response.status}`);
    const data = await response.json();


    const normalizedData = {
      ...data,
      extra: {
        salesPerson: data.salesPersonId ? { id: data.salesPersonId } : null,
        priceCategoryId: data.priceCategoryId || null,
      },
    };
    return normalizedData;
  } catch (error) {

    return null;
  }
};


//obtener vendedor por id
export const getSalesPersonById = async (salesPersonId: string): Promise<any | null> => {
  try {
    if (!salesPersonId) {
      throw new Error("ID de vendedor no válido");
    }

    const response = await fetch(`${API_URL}/users/getById/${salesPersonId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {

    return null;
  }
};

//  Obtener TODOS los clientes (solo para Admin)
export const getAllClients = async (): Promise<Cliente[]> => {
  try {

    
    const response = await fetch(`${API_URL}/users/client`, {
      method: "GET",
      headers: getAuthHeaders(), //  Enviar token
    });



    if (!response.ok) {
      const errorText = await response.text();

      
      if (response.status === 401) {
        throw new Error("No autorizado. Solo administradores pueden acceder a esta función.");
      }
      
      if (response.status === 403) {
        throw new Error("Acceso denegado. No tiene permisos para ver todos los clientes.");
      }
      
      throw new Error(`Error al obtener clientes (${response.status}): ${errorText}`);
    }

    const data = await response.json();


    // Mapear los datos al formato del frontend
    return Array.isArray(data) 
      ? data.map((item: any) => ({
          _id: item._id || item.id,
          id: item.id || item._id,
          name: item.name || "",
          lastName: item.lastName || "",
          emails: item.email || item.emails || [],
          phones: item.phone || item.phones || [],
          address: Array.isArray(item.address) ? item.address : [item.address || ""],
          city: item.cityId || item.city || "",
          password: "", // 
          role: item.role || "Client",
          priceCategoryId: item.priceCategoryId || "",
          priceCategory: item.priceCategory || null,
          salesPersonId: item.salesPersonId || "",
          state: item.state === "Active" ? "activo" : 
                 item.state === "Inactive" ? "inactivo" : 
                 item.state || "activo",
          clients: item.clients || [],
        }))
      : [];

  } catch (error) {
 
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Error de conexión. Verifique su red e intente nuevamente.");
    }
    
    throw error instanceof Error ? error : new Error("Error desconocido al obtener clientes.");
  }
};


interface Department {
  _id: string;
  name: string;
  __v: number;
}

interface City {
  _id: string;
  department: string; // ID del departamento
  name: string;
  __v: number;
}

// Obtener todos los departamentos
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${API_URL}/users/departments`, {
      method: "GET",
      headers: getAuthHeaders(false), // No se necesita Content-Type para GET
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener departamentos: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data; // Asumiendo que el backend devuelve un array de departamentos
  } catch (error) {

    throw error;
  }
};

// Obtener ciudades por ID de departamento
export const getCitiesByDepartment = async (departmentId: string): Promise<City[]> => {
  try {
    if (!departmentId) {

      return [];
    }

    const response = await fetch(`${API_URL}/users/cities/${departmentId}`, {
      method: "GET",
      headers: getAuthHeaders(false), // No se necesita Content-Type para GET
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al obtener ciudades: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data; // Asumiendo que el backend devuelve un array de ciudades
  } catch (error) {

    throw error;
  }
};