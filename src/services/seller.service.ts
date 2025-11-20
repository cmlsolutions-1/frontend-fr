// src/services/seller.service.ts
import type { Vendedor } from "@/interfaces/user.interface";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener el token
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

//obtener todos los vendedores
export const getVendedores = async (): Promise<Vendedor[]> => {
  try {
    const res = await fetch(`${API_URL}/users/salesPerson`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) throw new Error("Error al obtener vendedores");

    const data = await res.json();

    // Mapear los datos manteniendo la estructura original
    return data.map(
      (item: any): Vendedor => ({
        _id: item._id,
        id: item.id,
        name: item.name,
        lastName: item.lastName,
        password: "", // Campo requerido pero no viene del backend
        emails: item.emails || [], // Mantener estructura original
        phones: item.phones || [], // Mantener estructura original
        address: Array.isArray(item.address) ? item.address : [],
        city: item.cityId || item.city || "",
        role: item.role,
        priceCategoryId: "", 
        state: item.state === "Active" ? "activo" : "inactivo",
        salesPersonId: "", // Asumiendo que no aplica aquí
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
    !vendedor.emails[0]?.EmailAddres?.trim()
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
        EmailAddres: vendedor.emails[0].EmailAddres.trim(),
        IsPrincipal: true,
      },
    ],
    phone: [
      {
        NumberPhone: vendedor.phones[0]?.NumberPhone?.replace(/\D/g, "") || "",
        Indicative: vendedor.phones[0]?.Indicative || "+57",
        IsPrincipal: true,
      },
    ],
    address: [vendedor.address[0] || ""],
    city: vendedor.city,
    password: vendedor.password,
    role: vendedor.role,
    state: "Active",
    priceCategory: vendedor.priceCategoryId || "",
  };

  console.log("Payload final para el backend:", payload);

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: getAuthHeaders(),
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
          EmailAddres: e.EmailAddres,
          IsPrincipal: e.IsPrincipal,
        })) || [],
      phones:
        responseData.phone?.map((p: any) => ({
          NumberPhone: p.NumberPhone,
          Indicative: p.Indicative,
          IsPrincipal: p.IsPrincipal,
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

// src/services/seller.service.ts (o donde tengas updateVendedor)

// Actualizar un vendedor
// Asumiendo que la interfaz Vendedor también usa Email[] y Phone[] con mayúsculas
export const updateVendedor = async (vendedor: Vendedor): Promise<Vendedor> => {
  // Validaciones básicas para la actualización (similares a updateClient)
  // Priorizar _id para la actualización, pero fallback a id si _id no está
  const sellerIdToUpdate = vendedor._id || vendedor.id;
  if (!sellerIdToUpdate) {
    throw new Error("El ID (_id o id) del vendedor es requerido para la actualización.");
  }

  // --- Construcción DIRECTA del payload para la actualización usando _id ---
  // Similar a updateClient, enviamos el _id en el cuerpo
  const payloadToSend: any = {
    // Usar _id como el identificador principal
    _id: sellerIdToUpdate,
    // Añadir campos que se pueden actualizar. Ajusta según tu backend y la interfaz Vendedor.
    // Asumiendo que Vendedor tiene una estructura similar a Cliente
    name: vendedor.name?.trim() || undefined,
    lastName: vendedor.lastName?.trim() || undefined,

    // Manejar emails (si aplica)
    // Ajusta según si los vendedores tienen emails y la estructura exacta
    email: vendedor.emails && vendedor.emails.length > 0 ?
      vendedor.emails.map(e => ({
        EmailAddres: e.EmailAddres?.trim(), // Mayúscula
        IsPrincipal: e.IsPrincipal
      })) : undefined,

    // Manejar phones (si aplica)
    // Ajusta según si los vendedores tienen teléfonos y la estructura exacta
    phone: vendedor.phones && vendedor.phones.length > 0 ?
      vendedor.phones.map(p => ({
        NumberPhone: p.NumberPhone?.replace(/\D/g, ''), // Mayúscula y limpieza
        Indicative: p.Indicative,
        IsPrincipal: p.IsPrincipal
      })) : undefined,

    address: vendedor.address && vendedor.address.length > 0 ? vendedor.address : undefined,
    city: vendedor.city || undefined,
    // password: vendedor.password || undefined, // Cuidado al actualizar passwords
    // role: vendedor.role || undefined, // Generalmente no se cambia el rol
    priceCategory: vendedor.priceCategoryId || undefined, // Si aplica
    // salesPerson: vendedor.salesPerson || undefined, // Un vendedor no tiene un "salesPerson" asignado, eso es para clientes
    state: vendedor.state === "activo" ? "Active" :
           vendedor.state === "inactivo" ? "Inactive" : undefined,
    // clients: vendedor.clients || undefined, // Si se maneja la lista de clientes directamente
  };

  // Limpiar el payload de campos undefined para no enviarlos innecesariamente
  const cleanPayload = Object.fromEntries(
    Object.entries(payloadToSend).filter(([_, v]) => v !== undefined)
  );

  console.log("Payload a enviar para ACTUALIZAR VENDEDOR (usando _id):", JSON.stringify(cleanPayload, null, 2));

  try {
    console.log("Vendedor antes del fetch (para actualizar):", vendedor);
    // Usar la misma URL base que updateClient
    const response = await fetch(`${API_URL}/users/`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(cleanPayload),
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      // Manejar respuestas no JSON (por ejemplo, 404, 500)
      responseData = { message: `Error HTTP: ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      console.error("Error del backend al actualizar vendedor:", responseData);
      throw new Error(responseData.message || `Error al actualizar el vendedor (${response.status})`);
    }

    // --- Manejo de la respuesta del backend ---
    // Asumir una estructura similar a la de updateClient
    let updatedSellerData: any = {};
    if (responseData && typeof responseData === 'object') {
      if ('user' in responseData && responseData.user && typeof responseData.user === 'object' && 'id' in responseData.user) {
        // Si la respuesta es { user: ..., token: ... }
        updatedSellerData = responseData.user;
      } else if ('id' in responseData) {
        // Si la respuesta es el vendedor/usuario directamente
        updatedSellerData = responseData;
      } else {
        // Estructura inesperada, usar datos del payload como base
        console.warn("Respuesta inesperada del backend (éxito en actualización de vendedor):", responseData);
        updatedSellerData = { ...cleanPayload, ...responseData }; // Mezclar
      }
    }

    // Mapear el estado del backend al formato del frontend si es necesario
    const mappedState = updatedSellerData.state === 'Active' ? 'activo' :
                       updatedSellerData.state === 'Inactive' ? 'inactivo' :
                       updatedSellerData.state || vendedor.state || 'activo'; // Fallback

    // --- Crear el objeto Vendedor final para devolver al frontend ---
    // Asegúrate de que todos los campos requeridos por la interfaz Vendedor estén presentes
    const updatedVendedor: Vendedor = {
      // Priorizar _id e id del backend, fallback a los del vendedor original
      _id: updatedSellerData._id || vendedor._id,
      id: updatedSellerData.id || vendedor.id,
      name: updatedSellerData.name ?? vendedor.name,
      lastName: updatedSellerData.lastName ?? vendedor.lastName,
      // Mapear emails si vienen en la respuesta
      emails: updatedSellerData.email || updatedSellerData.emails || vendedor.emails || [], // Default a array vacío
      // Mapear phones si vienen en la respuesta
      phones: updatedSellerData.phone || updatedSellerData.phones || vendedor.phones || [], // Default a array vacío
      address: updatedSellerData.address || vendedor.address || [],
      city: updatedSellerData.cityId || updatedSellerData.city || vendedor.city || '',
      password: "", // Nunca devolver la contraseña
      role: updatedSellerData.role || vendedor.role || "SalesPerson", // Default a SalesPerson
      priceCategoryId: updatedSellerData.priceCategory || vendedor.priceCategoryId || "",
      // salesPerson: updatedSellerData.salesPerson || vendedor.salesPerson || "", // No debería aplicar
      state: mappedState,
      clients: updatedSellerData.clients || vendedor.clients || [], // Default a array vacío
      // Añade aquí cualquier otro campo específico de Vendedor que tenga tu interfaz
    };

    console.log("Vendedor actualizado exitosamente:", updatedVendedor);
    return updatedVendedor;

  } catch (error) {
    console.error("Error en la solicitud updateVendedor:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Error de conexión. Verifique su red e intente nuevamente.");
    }
    if (error instanceof Error) {
      throw error; // Relanzar errores con mensaje
    } else {
      throw new Error("No se pudo actualizar el vendedor. Por favor intente nuevamente.");
    }
  }
};

// Eliminar un vendedor
export const deleteVendedor = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch (error) {
    console.error("Error eliminando vendedor:", error);
    return false;
  }
};

// Obtener vendedor por ID
export const getSalesPersonById = async (
  salesPersonId: string
): Promise<any | null> => {
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

    return data.user || null;
  } catch (error) {
    console.error("Error al obtener vendedor por ID:", error);
    return null;
  }
};

/* ------RESTABLECER CONTRASEÑA */

// === 1. Generar código ===
export const generateResetPasswordCode = async (email: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/auth/recove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return res.ok;
  } catch (error) {
    console.error("Error generando código:", error);
    return false;
  }
};

// === 2. Validar código ===
export const validateResetPasswordCode = async (email: string, code: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/auth/validate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ email, code }),
    });

    return res.ok;
  } catch (error) {
    console.error("Error validando código:", error);
    return false;
  }
};

// === 3. Nueva contraseña ===
export const setNewPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword }),
    });

    return res.ok;
  } catch (error) {
    console.error("Error estableciendo nueva contraseña:", error);
    return false;
  }
};
