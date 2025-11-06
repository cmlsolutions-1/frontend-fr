//src/components/productsTable/products-table.tsx

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { getProducts } from "@/services/products.service";
import { Product } from '@/interfaces/product.interface';


// --- CATEGORÍAS (puedes cargarlas desde el backend si es dinámico) ---
const CATEGORIAS = ["Electrónica", "Ropa", "Accesorios", "Hogar", "Deportes", "Alimentos"];

// --- INTERFAZ PARA FILA EN EDICIÓN ---
interface EditingRow {
  id: string;
  category: string;
  master: string;
  editingCategory: boolean;
  editingMaster: boolean;
}

interface ProductWithCategory extends Product {
  category: string;
}

export const ProductsTable = () => {
  const [productos, setProductos] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        // Mapear para agregar category temporalmente como subgategoryId
        const mappedProducts = data.map(p => ({
          ...p,
          category: p.subgategoryId || "General",
        }));
        setProductos(mappedProducts);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("No se pudieron cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEditStart = (product: ProductWithCategory) => {
  setEditingRow({
    id: product._id,
    category: product.category,
    master: getMasterValue(product).toString(),
    editingCategory: true,  // Editar categoría por defecto
    editingMaster: true,    // Editar master por defecto
  });
};

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleSave = async (product: Product) => {
    if (!editingRow) return;

    setLoadingId(editingRow.id);

    try {
    // Solo validar master si está en edición
    let masterNum: number | undefined;
    if (editingRow.editingMaster) {
      masterNum = Number.parseInt(editingRow.master, 10);
      if (isNaN(masterNum)) {
        alert("Master debe ser un número válido");
        setLoadingId(null);
        return;
      }
    }

    // Lógica para actualizar solo lo que esté marcado como editable
    if (editingRow.editingCategory) {
      // Aquí harías la llamada para actualizar categoría
      // await updateCategory(product._id, editingRow.category);
    }

    if (editingRow.editingMaster) {
      // Aquí harías la llamada para actualizar master
      // await updateMaster(product._id, masterNum!);
    }

      // Actualizar estado local
    setProductos(
      productos.map((p) =>
        p._id === editingRow.id
          ? {
              ...p,
              category: editingRow.editingCategory ? editingRow.category : p.category,
              packages: editingRow.editingMaster ? updateMasterPackage(p.packages, masterNum!) : p.packages,
            }
          : p
      )
    );

      setEditingRow(null);
      console.log("Producto actualizado:", {
        id: product._id,
        category: editingRow.editingCategory ? editingRow.category : undefined,
      master: editingRow.editingMaster ? masterNum : undefined,
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el producto");
    } finally {
      setLoadingId(null);
    }
  };

   const getMasterValue = (product: ProductWithCategory): number => {
    const masterPackage = product.packages?.find(p => p.typePackage === "Master");
    return masterPackage ? masterPackage.mount : 0;
  };

  const updateMasterPackage = (packages, newValue: number) => {
    if (!packages || packages.length === 0) {
      return [{ typePackage: "Master", mount: newValue }];
    }

    return packages.map(p => (p.typePackage === "Master" ? { ...p, mount: newValue } : p));
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm ">
      <table className="min-w-full divide-y divide-gray-200">
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
  {productos.map((product) => {
    const isEditing = editingRow?.id === product._id;
    const isSaving = loadingId === product._id;
    const masterValue = getMasterValue(product);

    return (
      <tr key={product._id}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
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
              {/* Checkbox para editar categoría */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingRow.editingCategory}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, editingCategory: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm">Editar</label>
              </div>

              {editingRow.editingCategory && (
                <select
                  value={editingRow.category}
                  onChange={(e) => setEditingRow({ ...editingRow, category: e.target.value })}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs">
              {product.category}
            </span>
          )}
        </td>

        {/* Columna Master - Editable */}
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              {/* Checkbox para editar master */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingRow.editingMaster}
                  onChange={(e) =>
                    setEditingRow({ ...editingRow, editingMaster: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm">Editar</label>
              </div>

              {editingRow.editingMaster && (
                <input
                  type="number"
                  value={editingRow.master}
                  onChange={(e) => setEditingRow({ ...editingRow, master: e.target.value })}
                  className="border rounded-md px-2 py-1 text-sm w-24"
                  placeholder="0"
                />
              )}
            </div>
          ) : (
            <span className="font-semibold text-gray-900">{masterValue}</span>
          )}
        </td>

        {/* Botones de Acción */}
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {isEditing ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleSave(product)}
                disabled={isSaving}
                className={`px-3 py-1 rounded-md text-white text-sm flex items-center gap-1 ${
                  isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Check className="w-4 h-4" />
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
    </div>
  );
};