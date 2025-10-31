// src/services/bancoImagenes.service.ts

const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => {
  try {
    const authData = localStorage.getItem("auth-storage");
    if (!authData) return null;

    const parsed = JSON.parse(authData);
    return parsed.state?.token || parsed.token || null;
  } catch (error) {
    return null;
  }
};

const getAuthHeaders = (includeContentType: boolean = true) => {
  const token = getToken();
  const headers: Record<string, string> = {};

  // NO incluir Content-Type para FormData
  // if (includeContentType) {
  //   headers["Content-Type"] = "application/json";
  // }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Nueva función para subir imágenes
export const uploadImages = async (files: File[]): Promise<any> => { // Ajusta el tipo de retorno según la estructura real de tu respuesta
  if (files.length === 0) {
    throw new Error("No hay archivos para subir.");
  }

  const formData = new FormData();

  // Añadir cada archivo al FormData con la clave 'file'
  // Si el backend espera múltiples archivos en un solo campo, haz esto:
  files.forEach(file => {
    formData.append('file', file); // Puedes usar 'file' o 'file[]' dependiendo de cómo lo espere el backend
  });

  // Si el backend espera cada archivo con un nombre único, haz algo como:
  // files.forEach((file, index) => {
  //   formData.append(`file_${index}`, file);
  // });

  try {

    const response = await fetch(`${API_URL}/upload`, { // Asegúrate que esta es la URL correcta
      method: 'POST',
      headers: {
        // NO enviamos Content-Type, el navegador lo hace automáticamente con el boundary correcto
        ...getAuthHeaders(false), // Mandamos headers de autenticación, pero sin Content-Type
      },
      body: formData,
    });



    if (!response.ok) {
      const errorText = await response.text(); // O response.json() si el backend devuelve JSON

      throw new Error(`Error al subir imágenes: ${response.status} - ${errorText}`);
    }

    const data = await response.json(); // Asumiendo que el backend devuelve JSON

    return data; // Devuelve la respuesta del backend

  } catch (error) {

    throw error; // Relanza el error para que lo maneje el componente
  }
};

