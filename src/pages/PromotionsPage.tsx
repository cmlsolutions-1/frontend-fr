// src/pages/PromotionsPage.tsx
import React, { useState } from "react";
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
import { useEffect } from "react";
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
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingModal, setLoadingModal] = useState(false);

  // Cargar promociones y productos desde backend una sola vez
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (promotions.length === 0) {
          await loadPromotions();
        }

        const productList = await getProducts();
        setProducts(productList);
        setLoadingProducts(false);
      } catch (error) {

        setLoadingProducts(false);
        alert("No se pudieron cargar productos o promociones");
      }
    };

    fetchData();
  }, []);

  // Estado del formulario (adaptado al backend)

  const [formData, setFormData] = useState({
    name: "",
    percentage: 0,
    typePackage: "unidad" as "unidad" | "master",
    minimumQuantity: 1,
    products: [],
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

  const handleCreatePromotion = () => {
    // Verificar que los productos estén cargados antes de abrir el modal
    if (loadingProducts) {
      alert("Cargando productos, espera un momento...");
      return;
    }
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    // Verificar que los productos estén cargados antes de abrir el modal
    if (loadingProducts) {
      alert("Cargando productos, espera un momento...");
      return;
    }

    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      percentage: promotion.percentage,
      typePackage: promotion.typePackage === "inner" || promotion.typePackage === "unidad" ? "unidad" : "master",
      minimumQuantity: promotion.minimumQuantity,
      products: Array.isArray(promotion.products)
      ? promotion.products.map((p: any) => typeof p === 'string' ? p : p._id)
      : [],
      startDate: promotion.startDate
    ? new Date(promotion.startDate).toISOString().split("T")[0] // muestra "2025-09-17"
    : "",
  endDate: promotion.endDate
    ? new Date(promotion.endDate).toISOString().split("T")[0] // muestra "2025-09-20"
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

  const allProductIds = products.map((p) => p._id);

  const offerData = {
    name: formData.name,
    percentage: Number(formData.percentage),
    startDate: new Date(formData.startDate).toISOString(),
    endDate: new Date(formData.endDate).toISOString(),
    typePackage: formData.typePackage === "unidad" ? "inner" : "master",
    isAll: formData.isAll,
    products: formData.isAll ? [] : formData.products,
    state: formData.state,
    minimumQuantity:
      formData.typePackage === "master" ? 1 : formData.minimumQuantity,
  };


   

  try {
    if (editingPromotion) {
      const promotionId = (editingPromotion as any)._id || (editingPromotion as any).id;
      if (!promotionId) {

      return;
    }
      const result = await updatePromotion(promotionId, offerData);
      const updatedPromo = (result as any).offer ?? result;

      // Normalizar lo que viene del backend
      const normalizedPromo: Promotion = {
        ...updatedPromo,
        id: updatedPromo._id || updatedPromo.id,
        typePackage: updatedPromo.typePackage === "inner" ? "unidad" : "master",
        products: updatedPromo.isAll ? [] : updatedPromo.products,
      };

      // Actualizamos el store
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

    alert("Hubo un problema al guardar la oferta");
  }
};

  const handleDeletePromotion = async (id: string) => {
    try {
      await deletePromotion(id);
      usePromotionStore.getState().deletePromotion(id);
    } catch (error) {
      alert("Hubo un problema al eliminar la promoción");
    }
  };

  const isPromotionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  const productOptions = products.map((product) => ({
    value: product._id,
    label: `${product.detalle || product.referencia || "Producto"} (${
      product._id
    })`,
  }));

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

  if (loadingProducts) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Gestión de Promociones</h1>
          <p className="text-sm text-gray-500">
            Crea y administra promociones para tus productos
          </p>
        </div>
        <Button onClick={handleCreatePromotion} 
          className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-2 h-4" />
          {loadingProducts ? "Cargando..." : "Nueva Promoción"}
        </Button>
      </div>

      {/* Tabla de promociones */}
      <div className="overflow-x-auto rounded-lg shadow-sm">
        <PromotionTable
          promotions={promotions}
          products={products}
          onEdit={handleEditPromotion}
          onDelete={handleDeletePromotion}
          isPromotionExpired={isPromotionExpired}
          getStatusBadge={getStatusBadge}
        />
      </div>

      {/* Modal del formulario */}
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
