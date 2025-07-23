import type { Cliente } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

export const saveClient = async (cliente: Cliente): Promise<Cliente> => {
  // Validaciones obligatorias
  // Validar email primero
  const emailPrincipal = cliente.emails?.[0]?.emailAddress;
  if (!emailPrincipal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailPrincipal)) {
    throw new Error("Debe proporcionar un email válido");
  }
  if (!cliente.salesPerson) {
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

/*     // Transformar la respuesta al formato de tu frontend
    const createdClient: Cliente = {
      ...responseData.user,
      emails: responseData.user.emails,
      phones: responseData.user.phones,
      address: responseData.user.address,
      state: responseData.user.state === 'Active' ? 'activo' : 'inactivo',
      // Agrega otros campos necesarios
    };

    console.log("Cliente creado exitosamente:", createdClient);
    return createdClient;

  } catch (error) {
    console.error("Error en la solicitud:", error);
    throw new Error("No se pudo registrar el cliente. Por favor intente nuevamente.");
  }
}; */


/* //-- funcion para traer los clientes de un vendedor
export const getClientsBySeller = async (sellerId: string): Promise<Cliente[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesperson/${sellerId}/clients`);
    if (!res.ok) throw new Error("Error al obtener clientes");
    return await res.json();
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}; */

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