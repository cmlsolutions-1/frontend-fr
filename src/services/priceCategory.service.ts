

const API_URL = import.meta.env.VITE_API_URL;

// Traer todas las categorías de precios
export const getPriceCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/price-category`);
    if (!res.ok) {
      throw new Error("Error al obtener categorías de precios");
    }
    const data = await res.json();

    // Aseguramos que venga con id y name
    return data.map((p: any) => ({
      id: p._id || p.id,
      name: p.name,
    }));
  } catch (error) {
    console.error("Error cargando categorías de precios:", error);
    throw error;
  }
};
