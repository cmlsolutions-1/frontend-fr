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
      if (response.status === 401) {
        const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
        (authError as any).isAuthError = true;
        throw authError;
      }
      throw new Error(`No se pudieron filtrar los productos. Status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};



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

// Definimos la interfaz correcta según tu backend
export interface Category {
  code: string;
  name: string;
}

// Obtener todas las categorías
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/category/categories`, {
      method: "GET",
      headers: getAuthHeaders(false),
    });

    if (!response.ok) {
      throw new Error("No se pudieron cargar las categorías");
    }

    const data = await response.json();
    return data as Category[]; 
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    throw error;
  }
};

export const updateProductCategory = async (id: string, categoryId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/products/update-category/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ category: categoryId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `No se pudo actualizar la categoría del producto. Código: ${response.status}, Mensaje: ${errorText}`
      );
    }
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    throw error;
  }
};


// Actualizar master (mount) de un producto
export const updateProductMaster = async (
  id: string,
  mount: number,
  code: string,
  reference: string,
  brand: string,
  detail: string
): Promise<void> => {
  try {
    const body = {
      mount,
      code,
      reference,
      brand,
      detail,
    };


    const response = await fetch(`${API_URL}/products/update-master/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });

    console.log("📥 Respuesta status:", response.status);
    const text = await response.text();
    console.log("📥 Respuesta completa:", text);

    if (!response.ok) {
      throw new Error(`No se pudo actualizar el master del producto. Código: ${response.status}, Mensaje: ${text}`);
    }
  } catch (error) {
    console.error("Error al actualizar master:", error);
    throw error;
  }
};


// Obtener lista de favoritos
export const listFavoriteProducts = async (params: {
  page: number;
  limit: number;
}): Promise<Product[]> => {
  const { page, limit } = params;

  const url = new URL(`${API_URL}/products/list-favorite/`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
      (authError as any).isAuthError = true;
      (authError as any).status = 401;
      throw authError;
    }

    const text = await response.text();
    throw new Error(`No se pudieron cargar los favoritos. Status: ${response.status}. ${text}`);
  }

  const data = await response.json();
  return data as Product[];
};

// Activar / desactivar “Nuevo” (isFavorite)
export const updateProductFavoriteState = async (
  productId: string,
  state: boolean
) => {
  try {
    const response = await fetch(`${API_URL}/products/favorite/${productId}`, {
      method: "PUT",
      headers: getAuthHeaders(true), // incluye Authorization + Content-Type
      body: JSON.stringify({ state }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const authError = new Error("No autorizado. Tu sesión puede haber expirado.");
        (authError as any).isAuthError = true;
        (authError as any).status = 401;
        throw authError;
      }

      const text = await response.text();
      throw new Error(`No se pudo actualizar el estado de Nuevo. Status: ${response.status}. ${text}`);
    }

    return await response.json(); // { message, product }
  } catch (error) {
    console.error("Error al actualizar isFavorite:", error);
    throw error;
  }
};
