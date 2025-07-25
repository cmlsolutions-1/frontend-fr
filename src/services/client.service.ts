import type { Cliente } from "@/interfaces/user.interface";
import { normalizeClientPayload } from "@/utils/normalizeClientPayload";
import { UpdateUserDto } from "@/interfaces/update-user";


const API_URL = import.meta.env.VITE_API_URL;

export const saveClient = async (cliente: Cliente): Promise<Cliente> => {
  // Validaciones obligatorias
  // Validar email primero
  const emailPrincipal = cliente.emails?.[0]?.emailAddress;
  if (!emailPrincipal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrincipal)) {
    throw new Error("Debe proporcionar un email válido");
  }
  if (cliente.salesPerson) {
    throw new Error("Debe asignar un vendedor al cliente");
  }

  if (!cliente.emails?.[0]?.emailAddress) {
    throw new Error("El email es requerido");
  }

  if (!cliente.phones?.[0]?.numberPhone) {
    throw new Error("El teléfono es requerido");
  }

  // Estructura EXACTA que espera el backend
  const payload = {
    id: cliente.id,
    name: cliente.name.trim(),
    lastName: cliente.lastName.trim(),
    email: [{
      emailAddres: cliente.emails[0].emailAddress.trim(),
      isPrincipal: true,
    }],
    phone: [{
      numberPhone: cliente.phones[0].numberPhone.replace(/\D/g, ''),
      indicative: cliente.phones[0].indicative || "+57",
      isPrincipal: true,
    }],
    address: cliente.address || [""],
    city: cliente.city,
    password: cliente.password,
    role: "Client",
    priceCategory: cliente.priceCategory,
    salesPerson: cliente.salesPerson, // ID del vendedor asociado
    // state: "Active", // Siempre Active al crear
    // emailVerified: false,
    // emailValidated: false,
    // clients: []
  };

  console.log("Payload a enviar:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Agrega aquí otros headers necesarios como Authorization
      },
      body: JSON.stringify(payload),
    });

    let responseData;
    try {
        responseData = await response.json();
    } catch (parseError) {
        responseData = { message: `Error HTTP: ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      console.error("Error del backend:", responseData);
      throw new Error(responseData.message || `Error al registrar el cliente (${response.status})`);
    }



let createdClientData;
    if (responseData && typeof responseData === 'object' && 'id' in responseData) {
        // Si la respuesta es el cliente directamente
        createdClientData = responseData;
    } else if (responseData && typeof responseData === 'object' && responseData.user && typeof responseData.user === 'object' && 'id' in responseData.user) {
        // Si la respuesta es { user: Cliente }
        createdClientData = responseData.user;
    } else {
        // Si no hay datos útiles, crea uno básico basado en el payload o lanza un error
        console.warn("Respuesta inesperada del backend:", responseData);
        // Puedes lanzar un error o devolver un objeto parcial
        // throw new Error("Respuesta inesperada del servidor al crear el cliente.");
        // O asumir que fue exitoso y devolver un objeto básico
        createdClientData = {
            ...cliente, // Conserva datos locales
            id: responseData?.id || cliente.id || crypto.randomUUID(), // Usa ID del backend si existe
            // Mapea otros campos si es necesario
        };
    }

    // Mapear 'state' del backend ('Active'/'Inactive') a 'state' del frontend ('activo'/'inactivo')
    // Asegúrate de que 'state' en tu interfaz Cliente sea "activo" | "inactivo" | "Active" | "Inactive"
    // o ajusta el mapeo según sea necesario.
    const mappedState = createdClientData.state === 'Active' ? 'activo' : 
                       createdClientData.state === 'Inactive' ? 'inactivo' : 
                       createdClientData.state || 'activo'; // Valor por defecto

    const createdClient: Cliente = {
      ...createdClientData,
      state: mappedState, // Asegura el formato del estado
      // Si necesitas mapear otros campos específicos del backend al frontend, hazlo aquí
    };

    console.log("Cliente creado exitosamente:", createdClient);
    return createdClient;

  } catch (error) {
    // Es mejor relanzar errores de red/HTTP como están
    if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error("Error de red:", error);
        throw new Error("Error de conexión. Verifique su red e intente nuevamente.");
    }
    // Relanzar errores de la aplicación o del backend
    console.error("Error en la solicitud:", error);
    // Si ya es un Error con mensaje útil, relánzalo. Si no, crea uno.
    if (error instanceof Error) {
        throw error; // Relanzar el error original
    } else {
        throw new Error("No se pudo registrar el cliente. Por favor intente nuevamente.");
    }
  }
};

export const updateClient = async (cliente: Cliente): Promise<Cliente> => {
  // Validaciones básicas para la actualización
  if (!cliente.id) {
    throw new Error("El ID del cliente es requerido para la actualización.");
  }

  const emailPrincipal = cliente.emails?.[0]?.emailAddress;
  if (!emailPrincipal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrincipal)) {
    throw new Error("Debe proporcionar un email válido");
  }

if (!cliente.salesPerson || typeof cliente.salesPerson !== "string" || cliente.salesPerson.trim() === "") {
  throw new Error("Debe asignar un vendedor al cliente");
}

  if (!cliente.phones?.[0]?.numberPhone) {
    throw new Error("El teléfono es requerido");
  }

  // Estructura EXACTA que espera el backend para la actualización (UpdateUserDto)
  // Basado en tu ejemplo de Postman y la definición del DTO
  /* const payload = {
    id: cliente.id, // El ID es obligatorio para UpdateUserDto
    name: cliente.name?.trim() || undefined, // Enviar solo si hay valor
    lastName: cliente.lastName?.trim() || undefined,
    // Campos que pueden ser actualizados, enviar solo si existen/son válidos
    email: cliente.emails && cliente.emails.length > 0 ? cliente.emails.map(e => ({
      emailAddress: e.emailAddress?.trim(),
      isPrincipal: e.isPrincipal
    })) : undefined,
    phone: cliente.phones && cliente.phones.length > 0 ? cliente.phones.map(p => ({
      numberPhone: p.numberPhone?.replace(/\D/g, ''), // Limpiar
      indicative: p.indicative,
      isPrincipal: p.isPrincipal
    })) : undefined,
    address: cliente.address && cliente.address.length > 0 ? cliente.address : undefined,
    city: cliente.city || undefined,
    priceCategory: cliente.priceCategory || undefined,
    // Importante: El DTO espera 'idSalesPerson', no 'salesPerson'
    idSalesPerson: cliente.salesPerson || undefined, // Asumimos que ya es el _id correcto
    // state: cliente.state === "activo" ? "Active" : "Inactive", // Descomenta si necesitas actualizar el estado
  };

  // Limpiar el payload de campos undefined para no enviarlos innecesariamente
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined)
  ); */
  const cleanPayload = Object.fromEntries(
  Object.entries(normalizeClientPayload(cliente)).filter(([_, v]) => v !== undefined)
  );

  console.log("Payload a enviar para ACTUALIZAR:", JSON.stringify(cleanPayload, null, 2));

  try {
    console.log("Cliente antes del fetch:", cliente);
    const response = await fetch(`${API_URL}/users/`, {
      method: "PUT", 
      headers: {
        "Content-Type": "application/json",

      },
      body: JSON.stringify(cleanPayload),

      });

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      responseData = { message: `Error HTTP: ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      console.error("Error del backend al actualizar:", responseData);
      throw new Error(responseData.message || `Error al actualizar el cliente (${response.status})`);
    }

    // Manejar la respuesta del backend. Asumir que devuelve el cliente actualizado.
    // Ajusta esta parte según la estructura real de la respuesta del backend.
    let updatedClientData: any = {};
    if (responseData && typeof responseData === 'object') {
      if ('user' in responseData && responseData.user && typeof responseData.user === 'object' && 'id' in responseData.user) {
        // Si la respuesta es { user: ..., token: ... }
        updatedClientData = responseData.user;
      } else if ('id' in responseData) {
        // Si la respuesta es el cliente directamente
        updatedClientData = responseData;
      } else {
        // Estructura inesperada, usar datos del payload como base
        console.warn("Respuesta inesperada del backend (éxito en actualización):", responseData);
        updatedClientData = { ...cleanPayload, ...responseData }; // Mezclar
      }
    }

    // Mapear el estado del backend al formato del frontend si es necesario
    const mappedState = updatedClientData.state === 'Active' ? 'activo' :
                       updatedClientData.state === 'Inactive' ? 'inactivo' :
                       updatedClientData.state || cliente.state || 'activo'; // Fallback

    // Crear el objeto Cliente final para devolver al frontend
    // Es importante asegurarse de que los campos requeridos estén presentes
    const updatedClient: Cliente = {
      id: updatedClientData.id || cliente.id,
      _id: updatedClientData._id, // Si el backend lo proporciona
      name: updatedClientData.name ?? cliente.name,
      lastName: updatedClientData.lastName ?? cliente.lastName,
      emails: updatedClientData.email || updatedClientData.emails || cliente.emails,
      phones: updatedClientData.phone || updatedClientData.phones || cliente.phones,
      address: updatedClientData.address || cliente.address,
      city: updatedClientData.city || cliente.city,
      password: "", // Nunca devolver la contraseña
      role: updatedClientData.role || cliente.role || "Client",
      priceCategory: updatedClientData.priceCategory || cliente.priceCategory,
      salesPerson: updatedClientData.idSalesPerson || updatedClientData.salesPerson || cliente.salesPerson, // Mapear idSalesPerson del backend
      state: mappedState,
      // clients: updatedClientData.clients || cliente.clients || [],
    };

    console.log("Cliente actualizado exitosamente:", updatedClient);
    return updatedClient;

  } catch (error) {
    console.error("Error en la solicitud updateClient:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Error de conexión. Verifique su red e intente nuevamente.");
    }
    if (error instanceof Error) {
      throw error; // Relanzar errores con mensaje
    } else {
      throw new Error("No se pudo actualizar el cliente. Por favor intente nuevamente.");
    }
  }
};


export const getClientsBySeller = async (sellerId: string): Promise<Cliente[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesperson/${sellerId}/clients`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al obtener clientes (${res.status})`);
    }
    const data = await res.json();
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