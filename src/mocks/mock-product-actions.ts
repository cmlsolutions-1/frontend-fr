export const createUpdateProduct = async (formData: FormData) => {
  console.log('Producto guardado (mock):', Object.fromEntries(formData.entries()));

  return {
    ok: true,
    product: {
      slug: formData.get("slug") || "producto-mock",
    },
  };
};

export const deleteProductImage = async (id: string, url: string) => {
  console.log('Imagen eliminada (mock):', id, url);
  return true;
};
