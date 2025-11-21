// src/pages/PromotionsPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { PromotionTable, PromotionFormModal } from "@/components/promotion";
import { usePromotionStore } from "@/store/usePromotionStore";
import { Promotion } from "@/interfaces/promotion.interface";
import { Badge } from "@/components/ui/Badge";
import {
  FaRegCalendarCheck as CalendarDays,
  FaEdit as Edit,
  FaPlus as Plus,
  FaTrashAlt as Trash2,
} from "react-icons/fa";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/services/promotions.service";
import { getProducts } from "@/services/products.service";
import type { Product } from "@/interfaces/product.interface";

interface PromotionFormValues {
  name: string;
  percentage: number;
  typePackage: "unidad" | "master";
  minimumQuantity: number;
  products: string[];
  startDate: string;
  endDate: string;
  state: "Active" | "Inactive";
  isAll: boolean;
  description?: string;
}

export default function PromotionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );

  const { promotions, loading, loadPromotions } = usePromotionStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [promotionBeingEdited, setPromotionBeingEdited] = useState<string | null>(null);

  const loadProductsForModal = async () => {
    if (products.length === 0) {
      setLoadingProducts(true);
      try {
        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error("No se pudieron cargar los productos para el modal.", error);
        alert("No se pudieron cargar los productos para crear/editar la promoción.");
        throw error;
      } finally {
        setLoadingProducts(false);
      }
    } else {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        if (promotions.length === 0) {
          await loadPromotions();
        }
      } catch (error) {
        console.error("Error al cargar promociones:", error);
        alert("No se pudieron cargar las promociones");
      }
    };

    fetchPromotions();
  }, [promotions.length]);

  const [formData, setFormData] = useState({
    name: "",
    percentage: 0,
    typePackage: "unidad" as "unidad" | "master",
    minimumQuantity: 1,
    products: [], // Este array debe contener strings (_id de productos)
    startDate: "",
    endDate: "",
    state: "Active" as "Active" | "Inactive",
    isAll: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      percentage: 0,
      typePackage: "unidad",
      minimumQuantity: 1,
      products: [],
      startDate: "",
      endDate: "",
      state: "Active",
      isAll: false,
    });
    setEditingPromotion(null);
  };

  const handleCreatePromotion = async () => {
    setLoadingModal(true);
    try {
      await loadProductsForModal();
      resetForm();
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error al abrir modal de creación:", error);
    } finally {
      setLoadingModal(false); // <-- Nuevo: Finalizar indicador de carga
    }
  };

  // --- CORREGIDO: Función para extraer IDs ---
  const extractProductIds = (products: (string | any)[]): string[] => {
    return products
      .map(p => {
        // Si p es un string, es el ID
        if (typeof p === 'string') {
          return p;
        }
        // Si es un objeto, intenta _id o id
        return p?._id || p?.id || null; // Devuelve null si no se encuentra
      })
      .filter(id => id !== null && id !== "") as string[]; // Filtra nulls y strings vacíos
  };
  // --- FIN CORREGIDO ---

  const handleEditPromotion = async (promotion: Promotion) => {
    setPromotionBeingEdited(promotion._id ?? promotion.id);
    setLoadingModal(true);
    try {
      await loadProductsForModal();
      setEditingPromotion(promotion);

      const productIds = extractProductIds(promotion.products);

      setFormData({
        name: promotion.name,
        percentage: promotion.percentage,
        typePackage: promotion.typePackage === "inner" || promotion.typePackage === "unidad" ? "unidad" : "master",
        minimumQuantity: promotion.minimumQuantity,
        products: productIds, // <-- Asignar los IDs extraídos
        startDate: promotion.startDate
          ? new Date(promotion.startDate).toISOString().split("T")[0]
          : "",
        endDate: promotion.endDate
          ? new Date(promotion.endDate).toISOString().split("T")[0]
          : "",
        state:
          promotion.state === "Activo"
            ? "Active"
            : promotion.state === "Inactivo"
              ? "Inactive"
            : promotion.state,
        isAll: promotion.isAll,
      });
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error al abrir modal de edición:", error);
    } finally {
      setLoadingModal(false); // <-- Nuevo: Finalizar indicador de carga
      setPromotionBeingEdited(null); // <-- Nuevo: Limpiar marca de promoción en carga
    }
  };

  const handleSavePromotion = async () => {
    if (
      !formData.name ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.percentage ||
      isNaN(formData.percentage)
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    // --- VALIDACIÓN ADICIONAL: Si no es isAll, asegurar que se seleccionen productos ---
    if (!formData.isAll && formData.products.length === 0) {
      alert("Debes seleccionar al menos un producto o marcar 'Todos los productos'.");
      return;
    }
    // --- FIN VALIDACIÓN ---

    const offerData = {
      name: formData.name,
      percentage: Number(formData.percentage),
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      typePackage: formData.typePackage === "unidad" ? "inner" : "master",
      isAll: formData.isAll,
      products: formData.isAll ? [] : formData.products, // <-- Asegurar que sea un array de strings
      state: formData.state,
      minimumQuantity:
        formData.typePackage === "master" ? 1 : formData.minimumQuantity,
    };

    try {
      if (editingPromotion) {
        const promotionId = (editingPromotion as any)._id || (editingPromotion as any).id;
        if (!promotionId) {
          console.error("ID de promoción no encontrado para edición.");
          return;
        }
        const result = await updatePromotion(promotionId, offerData);
        const updatedPromo = (result as any).offer ?? result;

        const normalizedPromo: Promotion = {
          ...updatedPromo,
          id: updatedPromo._id || updatedPromo.id,
          typePackage: updatedPromo.typePackage === "inner" ? "unidad" : "master",
          products: updatedPromo.isAll ? [] : updatedPromo.products,
        };

        usePromotionStore.getState().updatePromotion(promotionId, normalizedPromo);
      } else {
        const result = await createPromotion(offerData);
        const newPromo = (result as any).offer ?? result;

        const normalizedNewPromo: Promotion = {
          ...newPromo,
          id: newPromo._id || newPromo.id,
          typePackage: newPromo.typePackage === "inner" ? "unidad" : "master",
          products: newPromo.isAll ? [] : newPromo.products,
        };

        usePromotionStore.getState().addPromotion(normalizedNewPromo);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error al guardar la promoción:", error);
      // Añadir información más específica del error si el backend lo provee
      if (error instanceof Error) {
          alert(`Hubo un problema al guardar la oferta: ${error.message}`);
      } else {
          alert("Hubo un problema al guardar la oferta");
      }
    }
  };

  const handleDeletePromotion = async (id: string) => {
    try {
      await deletePromotion(id);
      usePromotionStore.getState().deletePromotion(id);
    } catch (error) {
      console.error("Error al eliminar la promoción:", error);
      alert("Hubo un problema al eliminar la promoción");
    }
  };

  const isPromotionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  const getStatusBadge = (promotion: Promotion) => {
    const normalizedState =
      promotion.state === "Activo"
        ? "Active"
        : promotion.state === "Inactivo"
          ? "Inactive"
        : promotion.state;

    if (isPromotionExpired(promotion.endDate)) {
      return <Badge variant="secondary">Expirada</Badge>;
    }

    return normalizedState === "Active" ? (
      <Badge variant="default" className="bg-green-500">
        Activa
      </Badge>
    ) : (
      <Badge variant="destructive">Inactiva</Badge>
    );
  };

  // --- NUEVO: Componente de spinner para botones ---
  const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  // --- FIN NUEVO ---

  if (loadingModal && loadingProducts) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 mt-[100px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Promociones</h1>
          <p className="text-sm text-gray-500">
            Crea y administra promociones para tus productos
          </p>
        </div>
        <Button
          onClick={handleCreatePromotion}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
          disabled={loadingModal} // <-- Nuevo: Deshabilitar botón mientras carga
        >
          {loadingModal ? ( // <-- Nuevo: Mostrar spinner o texto según estado
            <>
              <LoadingSpinner />
              Cargando...
            </>
          ) : (
            <>
              <Plus className="w-2 h-4" />
              Nueva Promoción
            </>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <PromotionTable
          promotions={promotions}
          onEdit={handleEditPromotion}
          onDelete={handleDeletePromotion}
          isPromotionExpired={isPromotionExpired}
          getStatusBadge={getStatusBadge}
          loadingPromotionId={promotionBeingEdited}
        />
      </div>

      <PromotionFormModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPromotion={editingPromotion}
        formData={formData}
        setFormData={setFormData}
        handleSavePromotion={handleSavePromotion}
        allProducts={products}
      />
    </div>
  );
}