// src/pages/PromotionsPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { PromotionTable, PromotionFormModal } from '@/components/promotion';
import { usePromotionStore } from '@/store/usePromotionStore';
import { Promotion } from '@/interfaces/promotion.interface';
import { Badge } from '@/components/ui/Badge';
import { FaRegCalendarCheck as CalendarDays, 
        FaEdit as Edit, FaPlus as Plus, 
        FaTrashAlt as Trash2 
        } from 'react-icons/fa';
import { mockProducts } from '@/mocks/mock-products';

import { useEffect } from "react";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "@/services/promotions.service";


export default function PromotionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const { promotions,
    loading,
    loadPromotions,
    addPromotion,
    updatePromotion,
  } = usePromotionStore();
  
  //ESTO VA CON EL BACKEND


  useEffect(() => {
    if (promotions.length === 0) {
      loadPromotions();
    }
  }, []);

  if (loading) return <p>Cargando promociones...</p>;


// HASTA ACA VA CON EL BACKEND


  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discountPercentage: 0,
    typePackage: 'unidad' as 'unidad' | 'master',
    minimunQuantity: 1,
    productIds: [] as string[],
    productTypes: [] as string[],
    startDate: '',
    endDate: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      discountPercentage: 0,
      typePackage: 'unidad',
      minimunQuantity: 1,
      productIds: [],
      productTypes: [],
      startDate: '',
      endDate: '',
      isActive: true,
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
      description: promotion.description || '',
      discountPercentage: promotion.discountPercentage,
      typePackage: promotion.typePackage,
      minimunQuantity: promotion.minimunQuantity,
      productTypes: [...promotion.productTypes],
      productIds: promotion.productIds ?? [],
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSavePromotion = async () => {
    if (
      !formData.name ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.discountPercentage
    ) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    const promotionData = {
      ...formData,
      discountPercentage: Number(formData.discountPercentage),
      createdAt: new Date().toISOString().split('T')[0],
    };

    //--------------------------------DESHABILITAR PARA APLICAR BACKEND---------------
  //   if (editingPromotion) {
  //     updatePromotion(editingPromotion.id, promotionData);
  //   } else {
  //     addPromotion(promotionData);
  //   }

  //   setIsDialogOpen(false);
  //   resetForm();
  // };
//--------------------------------DESHABILITAR PARA APLICAR BACKEND---------------

//--------------------------------BACKEND---------------
try {
  let result;

  if (editingPromotion) {
    result = await updatePromotion(editingPromotion.id, promotionData);
    usePromotionStore.getState().updatePromotion(editingPromotion.id, promotionData);
  } else {
    result = await createPromotion(promotionData);
    usePromotionStore.getState().addPromotion(result);
  }

  setIsDialogOpen(false);
  resetForm();
} catch (error) {
  console.error("Error al guardar promoción:", error);
  alert("Hubo un problema al guardar la promoción");
}
};
//--------------------------------BACKEND---------------

//--------------------------------DATOS QUEMADOS---------------
  // const handleDeletePromotion = (id: string) => {
  //   deletePromotion(id);
  // };
  //--------------------------------DATOS QUEMADOS---------------

  //--------------------------------BACKEND---------------
  const handleDeletePromotion = async (id: string) => {
    try {
      await deletePromotion(id); // ✅ Llama al backend
      usePromotionStore.getState().deletePromotion(id); // ✅ Actualiza el store
    } catch (error) {
      console.error("Error al eliminar promoción:", error);
      alert("Hubo un problema al eliminar la promoción");
    }
  };
  //--------------------------------BACKEND---------------



  const isPromotionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date();
  };

  const productOptions = mockProducts.map(product => ({
    value: product.id,
    label: `${product.title} (${product.id})`,
  }));

  const getStatusBadge = (promotion: Promotion) => {
    if (isPromotionExpired(promotion.endDate)) {
      return <Badge variant="secondary">Expirada</Badge>;
    }

    return promotion.isActive ? (
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
          <p className="text-sm text-gray-500">Crea y administra promociones para tus productos</p>
        </div>
        <Button onClick={handleCreatePromotion}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Promoción
        </Button>
      </div>

      {/* Tabla de promociones */}
      <PromotionTable
        promotions={promotions}
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
      />
    </div>
  );
}