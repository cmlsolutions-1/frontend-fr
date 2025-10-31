

const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) {

      return null;
    }
    
    const parsed = JSON.parse(authData);
    const token = parsed.state?.token || null;
    
    if (token) {

    } else {

    }
    
    return token;
  } catch (error) {

    return null;
  }
};


const getAuthHeaders = (includeContentType: boolean = true) => {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {

  }
  
  return headers;
};

// Traer todas las categorías de precios
export const getPriceCategories = async () => {
  try {
    const token = localStorage.getItem("token"); // o donde lo guardes
    const res = await fetch(`${API_URL}/price-category`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error al obtener categorías de precios: ${res.status}`);
    }

    const data = await res.json();

    return data.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
    }));
  } catch (error) {

    throw error;
  }
};
