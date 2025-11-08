import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import {
  getProducts,
  updateProductCategory,
  updateProductMaster,
  getCategories,
} from "@/services/products.service";
import { Product } from "@/interfaces/product.interface";
import { Select } from "@/components/ui/Select";

// --- INTERFAZ EXTENDIDA LOCALMENTE ---
interface ProductWithCategory extends Product {
  category: string;
}

// --- INTERFAZ PARA FILA EN EDICIÓN ---
interface EditingRow {
  id: string;
  category: string;
  master: string;
}

// --- INTERFAZ DE CATEGORÍA ---
interface Category {
  _id: string;
  name: string;
}

export const ProductsTable = () => {
  const [productos, setProductos] = useState<ProductWithCategory[]>([]);
  const [categorias, setCategorias] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  //paginacion local
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;


  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productosData, categoriasData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const mappedProducts = productosData.map((p) => ({
          ...p,
          category: p.subgategory?._id || "",
        }));
        setProductos(mappedProducts);

        // Guardar categorías con _id y name
        setCategorias(
          categoriasData.map((cat) => ({
            _id: cat._id || "", 
            name: cat.name,
          }))
        );
      } catch (err) {
        console.error("Error al cargar productos o categorías:", err);
        setError("No se pudieron cargar los productos o categorías");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleEditStart = (product: ProductWithCategory) => {
    setEditingRow({
      id: product._id,
      category: product.category,
      master: getMasterValue(product).toString(),
    });
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleUpdateCategory = async (product: ProductWithCategory) => {
    if (!editingRow) return;
  
    setLoadingId(product._id + "-category");
  
    try {
      console.log("Intentando actualizar categoría con:", {
        id: product._id,
        categoryId: editingRow.category,
        tipo: typeof editingRow.category,
      });
  
      if (!editingRow.category || editingRow.category === "") {
        alert("Por favor selecciona una categoría válida antes de actualizar.");
        return;
      }
  
      await updateProductCategory(product._id, editingRow.category);
  
      setProductos((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? {
                ...p,
                category: editingRow.category,
                subgategory: { _id: editingRow.category }, 
              }
            : p
        )
      );
  
      console.log("Categoría actualizada:", {
        id: product._id,
        category: editingRow.category,
      });
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert("Error al actualizar la categoría");
    } finally {
      setLoadingId(null);
    }
  };
  

  const handleUpdateMaster = async (product: ProductWithCategory) => {
    if (!editingRow) return;
  
    const masterNum = Number.parseInt(editingRow.master, 10);
    if (isNaN(masterNum)) {
      alert("Master debe ser un número válido");
      return;
    }
  
    setLoadingId(product._id + "-master");
  
    try {
      
      await updateProductMaster(
        product._id,
        masterNum,
        product.codigo || product.referencia || "",
        product.referencia || "",
        product.brand?.name || "",
        product.detalle || ""
      );
  
   
      setProductos((prev) =>
        prev.map((p) =>
          p._id === product._id
            ? { ...p, packages: updateMasterPackage(p.packages, masterNum) }
            : p
        )
      );
  
      console.log("✅ Master actualizado:", { id: product._id, master: masterNum });
    } catch (error) {
      console.error("❌ Error al actualizar master:", error);
      alert("Error al actualizar el master");
    } finally {
      setLoadingId(null);
    }
  };

  // --- FUNCIONES AUXILIARES ---
  const getMasterValue = (product: ProductWithCategory): number => {
    const masterPackage = product.packages?.find(
      (p) => p.typePackage === "Master"
    );
    return masterPackage ? masterPackage.mount : 0;
  };

  const updateMasterPackage = (packages, newValue: number) => {
    if (!packages || packages.length === 0) {
      return [{ typePackage: "Master", mount: newValue }];
    }

    return packages.map((p) =>
      p.typePackage === "Master" ? { ...p, mount: newValue } : p
    );
  };

      // Calcular productos visibles en la página actual
      const startIndex = (currentPage - 1) * itemsPerPage;
      const currentProducts = productos.slice(startIndex, startIndex + itemsPerPage);
      const totalPages = Math.ceil(productos.length / itemsPerPage);

  if (loading) {


    return (

      <div className="text-center py-8 text-gray-500">
        Cargando productos y categorías...
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referencia
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Marca
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Master
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentProducts.map((product) => {
            const isEditing = editingRow?.id === product._id;
            const isCategoryLoading = loadingId === product._id + '-category';
            const isMasterLoading = loadingId === product._id + '-master';
            const masterValue = getMasterValue(product);

            return (
              <tr key={product._id}>
                <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                  {product.referencia}
                </td>
                <td className="px-6 py-4 max-w-xs text-sm text-gray-500">
                  {product.detalle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.stock}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.brand.name}
                </td>

                {/* Columna Categoría - Editable */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <Select
                          value={editingRow?.category || ""}
                          onValueChange={(value) => setEditingRow({ ...editingRow, category: value })}
                          options={categorias.map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                          }))}
                        />
                      <button
                        onClick={() => handleUpdateCategory(product)}
                        disabled={isCategoryLoading}
                        className={`text-xs px-2 py-1 rounded ${
                          isCategoryLoading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isCategoryLoading ? 'Guardando...' : 'Actualizar Categoría'}
                      </button>
                    </div>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs">
                          {categorias.find((cat) => cat._id === product.subgategory?._id)?.name || "Sin categoría"}
                        </span>
                  )}
                </td>

                {/* Columna Master - Editable */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {isEditing ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="number"
                        value={editingRow.master}
                        onChange={(e) => setEditingRow({ ...editingRow, master: e.target.value })}
                        className="border rounded-md px-2 py-1 text-sm w-24"
                        placeholder="0"
                      />
                      <button
                        onClick={() => handleUpdateMaster(product)}
                        disabled={isMasterLoading}
                        className={`text-xs px-2 py-1 rounded ${
                          isMasterLoading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {isMasterLoading ? 'Guardando...' : 'Actualizar Master'}
                      </button>
                    </div>
                  ) : (
                    <span className="font-semibold text-gray-900">{masterValue}</span>
                  )}
                </td>

                {/* Botones de Acción */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <button
                      onClick={handleCancel}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditStart(product)}
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      

      {productos.length === 0 && (
        <div className="text-center py-8 text-gray-500">No hay productos disponibles</div>
      )}
{/* 🔹 PAGINACIÓN */}
<div className="flex justify-center items-center py-4 gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};