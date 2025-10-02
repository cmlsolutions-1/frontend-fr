// src/services/products.service.ts
import type { Product } from "@/interfaces/product.interface";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener el token del localStorage
const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) {
      console.log("❌ No hay auth-storage en localStorage");
      return null;
    }
    
    const parsed = JSON.parse(authData);
    const token = parsed.state?.token || parsed.token || null;
    
    if (token) {
      console.log("✅ Token encontrado:", `${token.substring(0, 20)}...`);
    } else {
      console.log("❌ Token no encontrado en la estructura");
    }
    
    return token;
  } catch (error) {
    console.error("❌ Error al obtener token:", error);
    return null;
  }
};

// Función para obtener headers con token (REQUERIDO PARA TODAS LAS RUTAS)
const getAuthHeaders = (includeContentType: boolean = true) => {
  const token = getToken();
  
  // Siempre incluir Content-Type y Authorization
  const headers: Record<string, string> = {};
  
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("⚠️ No se encontró token - las rutas protegidas fallarán");
  }
  
  return headers;
};



// Nuevo endpoint para filtrar productos
export const filterProducts = async (params: {
  page: number;
  limit: number;
  search?: string;
  brands?: string[];
  categories?: string[];
}) => {
  const { page, limit, search = '', brands = [], categories = [] } = params;
  
  try {
    const url = new URL(`${API_URL}/products/filter`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('search', search);

    const requestBody = {
      brands,
      categories
    };

    console.log("🔍 Enviando filtro al backend:", requestBody);
    
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en filtrado:", errorText);
      throw new Error(`No se pudieron filtrar los productos. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Productos filtrados recibidos:", data.total, "total, página", data.page);
    
    return data;
  } catch (error) {
    console.error("Error al filtrar productos:", error);
    throw error;
  }
};


// Obtener productos (sin paginación por ahora)
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("🛒 Solicitando todos los productos (requiere token)");
    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: getAuthHeaders(), 
    });

    console.log("📥 Productos response status:", response.status);

    if (!response.ok) {
      
      throw new Error("No se pudieron cargar los productos");
    }

    return await response.json();
  } catch (error) {
    console.error("Error al traer productos:", error);
    throw error;
  }
};

export const getProductById = async (_id: string): Promise<Product> => {
  try {
    console.log("🔎 Solicitando producto por ID:", _id);
    
    const response = await fetch(`${API_URL}/products/${_id}`, {
      method: "GET",
      headers: getAuthHeaders(), 
    });

    console.log("📥 Producto response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error en la API:", errorText);
      
      if (response.status === 401) {
        throw new Error("No autorizado. Por favor inicie sesión nuevamente.");
      }
      
      if (response.status === 404) {
        throw new Error("Producto no encontrado.");
      }
      
      throw new Error(`No se pudo cargar el producto. Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Producto recibido:", data._id);
    
    // ✅ Validación adicional
    if (!data || !data._id) {
      throw new Error("Producto inválido recibido del servidor");
    }
    
    return data;
  } catch (error) {
    console.error("⚠️ Error en getProductById:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("No se pudo conectar con el servidor.");
    }
    
    throw error;
  }
};




// Función para buscar productos
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
    console.log("🔍 Buscando productos con query:", query);
    // Si no hay query, retornar todos los productos
    if (!query.trim()) {
      return await getProducts();
    }

    // Obtener todos los productos
    const allProducts = await getProducts();
    
    // Filtrar localmente por referencia, detalle o código
    const filteredProducts = allProducts.filter((product) =>
      product.referencia?.toLowerCase().includes(query.toLowerCase()) ||
      product.detalle?.toLowerCase().includes(query.toLowerCase()) ||
      product.codigo?.toLowerCase().includes(query.toLowerCase()) ||
      product._id?.toLowerCase().includes(query.toLowerCase())
    );

    console.log("✅ Productos filtrados encontrados:", filteredProducts.length);
    return filteredProducts;
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
};