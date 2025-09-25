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

  // Cargar promociones desde backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (promotions.length === 0) {
          await loadPromotions();
        }

        const productList = await getProducts();
        setProducts(productList);
      } catch (error) {
        console.error("❌ Error cargando datos:", error);
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
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      name: promotion.name,
      percentage: promotion.percentage,
      typePackage: promotion.typePackage === "inner" ? "unidad" : "master",
      minimumQuantity: promotion.minimumQuantity,
      products: promotion.products.map((p) => p._id),
      startDate: promotion.startDate,
      endDate: promotion.endDate,
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
    isAll: formData.products.length === 0 ||
    formData.products.length === allProductIds.length,
    products: formData.products.length === 0 ||
    formData.products.length === allProductIds.length
      ? []
      : formData.products,
    state: formData.state,
    minimumQuantity:
      formData.typePackage === "master" ? 1 : formData.minimumQuantity,
  };

  console.log("🚀 Payload que se enviará al backend:", offerData);
  console.log(
    "📊 Tipo de percentage:",
    typeof offerData.percentage,
    "Valor:",
    offerData.percentage
  );

  

  try {
    if (editingPromotion) {
      const result = await updatePromotion(editingPromotion.id, offerData);
      usePromotionStore.getState().updatePromotion(editingPromotion.id, result);
    } else {
      
      const result = await createPromotion(offerData); 
      console.log("🟢 Respuesta backend:", result);
      console.log("🟢 Lo que agrego al store:", result.offer);
      usePromotionStore.getState().addPromotion(result.offer);
    }

    setIsDialogOpen(false);
    resetForm();
  } catch (error) {
    console.error("❌ Error al guardar oferta:", error);
    alert("Hubo un problema al guardar la oferta");
  }
};

  const handleDeletePromotion = async (id: string) => {
    try {
      await deletePromotion(id);
      usePromotionStore.getState().deletePromotion(id);
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Promociones</h1>
          <p className="text-sm text-gray-500">
            Crea y administra promociones para tus productos
          </p>
        </div>
        <Button onClick={handleCreatePromotion}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      {/* Tabla de promociones */}
      <PromotionTable
        promotions={promotions}
        products={products}
        onEdit={handleEditPromotion}
        onDelete={handleDeletePromotion}
        isPromotionExpired={isPromotionExpired}
        getStatusBadge={getStatusBadge}
      />

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
