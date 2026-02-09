//src/components/productsTable/products-table.tsx

import { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getProducts, updateProductFavoriteState } from "@/services/products.service";
import type { Product } from "@/interfaces/product.interface";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton, 
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/SelectUsers";



interface EditingRow {
  id: string;
  isFavorite: boolean;
}

type FavoriteFilter = "ALL" | "ONLY_FAVORITE" | "ONLY_NOT_FAVORITE";

export const ProductsTable = () => {
  const { logout } = useAuthStore();

  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Filtro (opcional pero útil para “activar nuevos”)
  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("ALL");

  //Buscardor
  const [searchRef, setSearchRef] = useState("");


  // Paginación local
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

    useEffect(() => {
    setCurrentPage(1);
  }, [searchRef, favoriteFilter]);


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProducts();
        setProductos(data);
      } catch (err: any) {
        if (err?.isAuthError) {
          logout();
          setError("auth_expired");
        } else {
          setError("No se pudieron cargar los productos");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [logout]);

  const filteredProducts = useMemo(() => {
    let list = productos;

    // filtro por nuevo
    if (favoriteFilter === "ONLY_FAVORITE") {
    list = list.filter((p) => Boolean(p.isFavorite));
  } else if (favoriteFilter === "ONLY_NOT_FAVORITE") {
    list = list.filter((p) => !Boolean(p.isFavorite));
  }

  // búsqueda por referencia
  const term = searchRef.trim().toLowerCase();
  if (term) {
    list = list.filter((p) => (p.referencia || "").toLowerCase().includes(term));
  }

  return list;
}, [productos, favoriteFilter, searchRef]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Si cambias filtro y quedas en una página inválida
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const handleEditStart = (product: Product) => {
    setEditingRow({
      id: product._id,
      isFavorite: Boolean(product.isFavorite),
    });
  };

  const handleCancel = () => setEditingRow(null);

  const handleSaveFavorite = async (product: Product) => {
    if (!editingRow) return;

    const rowKey = product._id + "-favorite";
    setLoadingId(rowKey);

    try {
      await updateProductFavoriteState(product._id, editingRow.isFavorite);

      // Update local state
      setProductos((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, isFavorite: editingRow.isFavorite } : p
        )
      );

      setEditingRow(null);
    } catch (err: any) {
      if (err?.isAuthError) {
        logout();
        setError("auth_expired");
        return;
      }
      alert(err?.message || "Error al actualizar el estado de Nuevo");
    } finally {
      setLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error === "auth_expired") {
    return (
      <div className="container mx-auto p-6 mt-[90px]">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <p className="text-yellow-700">
            Tu sesión ha expirado. Por favor vuelve a iniciar sesión.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-white shadow-sm">
      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-600 font-medium">Filtro:</span>

        <button
          onClick={() => setFavoriteFilter("ALL")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            favoriteFilter === "ALL"
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Todos
        </button>

        <button
          onClick={() => setFavoriteFilter("ONLY_FAVORITE")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            favoriteFilter === "ONLY_FAVORITE"
              ? "bg-green-600 text-white"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          Solo Nuevos
        </button>

        <button
          onClick={() => setFavoriteFilter("ONLY_NOT_FAVORITE")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            favoriteFilter === "ONLY_NOT_FAVORITE"
              ? "bg-red-600 text-white"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          No Nuevos
        </button>

        {/* Buscador por referencia */}
        
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

        <input
          value={searchRef}
          onChange={(e) => setSearchRef(e.target.value)}
          placeholder="Buscar por referencia..."
          className="
            w-full pl-9 pr-9 py-2 rounded-md border border-gray-300 bg-white text-sm
            focus:outline-none focus:ring-1 focus:ring-[#F4C048] focus:border-[#F2B318]
          "
        />

      {searchRef.trim() && (
        <button
          type="button"
          onClick={() => setSearchRef("")}
          className="
            absolute right-2 top-1/2 -translate-y-1/2
            w-7 h-7 rounded-full
            flex items-center justify-center
            text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition
          "
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>


        <span className="ml-auto text-sm text-gray-600">
          Mostrando {filteredProducts.length} productos
        </span>
      </div>

      

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
              Nuevo
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {currentProducts.map((product) => {
            const isEditing = editingRow?.id === product._id;
            const isFavoriteLoading = loadingId === product._id + "-favorite";

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
                  {product.brand?.name}
                </td>

                {/* Nuevo (isFavorite) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
  {isEditing ? (
    <div className="flex flex-col gap-2 relative z-50">
      <Select
        value={editingRow.isFavorite ? "true" : "false"}
        onValueChange={(value) =>
          setEditingRow({ ...editingRow, isFavorite: value === "true" })
        }
      >
        <SelectTrigger
          className="
            mt-1 block w-28 cursor-default rounded-md bg-white py-1.5 pr-2 pl-3 text-left text-gray-900
            outline-1 -outline-offset-1 outline-[#F4C048]
            focus:outline-2 focus:-outline-offset-2 focus:outline-[#F4C048]
            sm:text-sm
          "
          style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}
        >
          <div className="flex items-center gap-3 pr-6">
            <SelectValue placeholder="..." />
          </div>
        </SelectTrigger>

        <SelectContent
          className="
            w-[--radix-select-trigger-width]
            rounded-md bg-white py-1 text-base shadow-lg outline-1 outline-black/5
            [--anchor-gap:4px] sm:text-sm
          "
          style={{ maxHeight: "160px", overflowY: "auto" }}
        >
          <SelectScrollUpButton />

          <SelectItem
            value="true"
            className="
              group/option relative flex cursor-default items-center py-2 pr-9 pl-3
              text-gray-900 select-none
              focus:bg-[#F2B318] focus:text-black focus:outline-hidden
            "
          >
            Sí
          </SelectItem>

          <SelectItem
            value="false"
            className="
              group/option relative flex cursor-default items-center py-2 pr-9 pl-3
              text-gray-900 select-none
              focus:bg-[#F2B318] focus:text-black focus:outline-hidden
            "
          >
            No
          </SelectItem>

          <SelectScrollDownButton />
        </SelectContent>
      </Select>

      <button
        onClick={() => handleSaveFavorite(product)}
        disabled={isFavoriteLoading}
        className={`text-xs px-2 py-1 rounded ${
          isFavoriteLoading
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-[#F4C048] text-white hover:bg-[#F2B318]"
        }`}
      >
        {isFavoriteLoading ? "Guardando..." : "Guardar"}
      </button>
    </div>
  ) : (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium ${
        product.isFavorite ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
      }`}
    >
      {product.isFavorite ? "Sí" : "No"}
    </span>
  )}
</td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isEditing ? (
                    <button
                      onClick={handleCancel}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Cancelar"
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay productos disponibles con los filtros aplicados
        </div>
      )}

      {/* PAGINACIÓN LOCAL */}
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
