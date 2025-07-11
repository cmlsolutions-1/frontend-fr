// src/components/promotion/PromotionFormModal.tsx
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TypePackageSelector } from '@/components/ui/TypePackageSelector';
import { Promotion } from '@/interfaces/promotion.interface';
import { ProductCheckList } from '@/components/ui/ProductCheckList';
import { SelectProduct } from '@/components/ui/SelectProduct';
import { SelectedProductsList } from '@/components/ui/SelectedProductsList';

interface PromotionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPromotion?: Promotion | null;
  formData: Omit<Promotion, 'id' | 'createdAt'> & {
    typePackage: 'unidad' | 'master';
  };
  setFormData: React.Dispatch<
    React.SetStateAction<
      Omit<Promotion, 'id' | 'createdAt'> & {
        typePackage: 'unidad' | 'master';
      }
    >
  >;
  handleSavePromotion: () => void;
}

export const PromotionFormModal: React.FC<PromotionFormModalProps> = ({
  isOpen,
  onOpenChange,
  editingPromotion,
  formData,
  setFormData,
  handleSavePromotion,
}) => {
  const handleTypePackageChange = (value: 'unidad' | 'master') => {
    if (value === 'master') {
      setFormData({
        ...formData,
        typePackage: value,
        minimunQuantity: 1,
      });
    } else {
      setFormData({
        ...formData,
        typePackage: value,
      });
    }
  };

  const handleProductChange = (selectedProductIds: string[]) => {
    setFormData({
      ...formData,
      productIds: selectedProductIds, // ✅ Ya existe en `Promotion`
    });
  };

  const removeProduct = (id: string) => {
    setFormData({
      ...formData,
      productIds: formData.productIds.filter(productId => productId !== id),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={editingPromotion ? 'Editar Promoción' : 'Crear Nueva Promoción'}
      description={
        editingPromotion
          ? 'Modifica los detalles de la promoción'
          : 'Completa los detalles para crear una nueva promoción'
      }
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSavePromotion}>
            {editingPromotion ? 'Guardar Cambios' : 'Crear Promoción'}
          </Button>
        </>
      }
    >
      <div className="py-4">
        <div className="grid gap-4">
          {/* Nombre */}
          <div className="grid gap-2">
            <label htmlFor="name">Nombre de la Promoción *</label>
            <input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Descuento Verano"
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          {/* Descripción */}
          <div className="grid gap-2">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe los detalles de la promoción"
              rows={3}
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          {/* Porcentaje de descuento */}
          <div className="grid gap-2">
            <label htmlFor="discount">Porcentaje de Descuento (%) *</label>
            <input
              id="discount"
              type="number"
              min="1"
              max="100"
              value={formData.discountPercentage || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discountPercentage: Number(e.target.value),
                })
              }
              placeholder="25"
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          {/* Tipo de paquete */}
          <div className="grid gap-2">
            <label htmlFor="typePackage">Tipo de paquete</label>
            <TypePackageSelector
              value={formData.typePackage}
              onChange={handleTypePackageChange}
            />
          </div>

          {/* Cantidad mínima */}
          {formData.typePackage === 'unidad' && (
            <div className="grid gap-2">
              <label htmlFor="minimunQuantity">
                Cantidad mínima para aplicar
              </label>
              <input
                id="minimunQuantity"
                type="number"
                min="1"
                value={formData.minimunQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimunQuantity: Number(e.target.value),
                  })
                }
                placeholder="Ej: 5"
                className="border border-gray-300 p-2 rounded"
              />
            </div>
          )}

          {formData.typePackage === 'master' && (
            <div className="grid gap-2">
              <label>Cantidad mínima para aplicar</label>
              <input
                type="number"
                value={1}
                disabled
                className="border border-gray-300 p-2 rounded bg-gray-100"
              />
            </div>
          )}

          {/* Selector de productos */}
          <div className="grid gap-2">
            <label htmlFor="products">Selecciona productos</label>
            <ProductCheckList
              selectedIds={formData.productIds}
              onValueChange={handleProductChange}
            />
            <SelectedProductsList selectedIds={formData.productIds} onRemove={removeProduct} />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="startDate">Fecha inicio *</label>
              <input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="border border-gray-300 p-2 rounded"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="endDate">Fecha expiración *</label>
              <input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="border border-gray-300 p-2 rounded"
              />
            </div>
          </div>

          {/* Estado activo */}
          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm">
              Activar promoción inmediatamente
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
};