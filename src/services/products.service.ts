// src/services/products.service.ts
import type { Product } from "@/interfaces/product.interface";

const API_URL = import.meta.env.VITE_API_URL;

// Obtener el token del localStorage
const getToken = () => {
  try {
    const authData = localStorage.getItem('auth-storage');
    if (!authData) {

      return null;
    }
    
    const parsed = JSON.parse(authData);
    const token = parsed.state?.token || parsed.token || null;
    
    if (token) {

    } else {

    }
    
    return token;
  } catch (error) {

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

    
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(requestBody),
    });

   

if (!response.ok) {
      // --- AÑADIR VERIFICACIÓN DE 401 ---
      if (response.status === 401) {
         const errorText = await response.text(); // O await response.json() si el backend devuelve JSON
  
         const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
         (authError as any).isAuthError = true; // Marcar como error de autenticación
         (authError as any).status = 401;
         throw authError;
      }
      // --- FIN VERIFICACIÓN DE 401 ---

      const errorText = await response.text();

      throw new Error(`No se pudieron filtrar los productos. Status: ${response.status}`);
    }

    const data = await response.json();
 

    return data;
  } catch (error) {

    throw error;
  }
};



// Obtener productos (sin paginación por ahora)
export const getProducts = async (): Promise<Product[]> => {
  try {

    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: getAuthHeaders(), 
    });



 if (!response.ok) {
      // --- AÑADIR VERIFICACIÓN DE 401 ---
      if (response.status === 401) {
         const errorText = await response.text(); // O await response.json() si el backend devuelve JSON

         const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
         (authError as any).isAuthError = true; // Marcar como error de autenticación
         (authError as any).status = 401;
         throw authError;
      }
      // --- FIN VERIFICACIÓN DE 401 ---

      throw new Error("No se pudieron cargar los productos");
    }

    return await response.json();
  } catch (error) {

    throw error;
  }
};





export const getProductById = async (_id: string): Promise<Product> => {
  try {

    
    const response = await fetch(`${API_URL}/products/${_id}`, {
      method: "GET",
      headers: getAuthHeaders(), 
    });


    if (!response.ok) {
      const errorText = await response.text();


      // --- AÑADIR VERIFICACIÓN DE 401 ---
      if (response.status === 401) {

         const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
         (authError as any).isAuthError = true; // Marcar como error de autenticación
         (authError as any).status = 401;
         throw authError;
      }
      // --- FIN VERIFICACIÓN DE 401 ---
      
      if (response.status === 404) {
        throw new Error("Producto no encontrado.");
      }
      
      throw new Error(`No se pudo cargar el producto. Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data._id) {
      throw new Error("Producto inválido recibido del servidor");
    }
    
    return data;
  } catch (error) {

    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("No se pudo conectar con el servidor.");
    }
    
    throw error;
  }
};




// Función para buscar productos
export const searchProducts = async (query: string): Promise<Product[]> => {
  try {
  
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


    return filteredProducts;
  } catch (error) {

    throw error;
  }
};