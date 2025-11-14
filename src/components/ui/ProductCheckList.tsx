// src/components/ui/ProductCheckList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Product } from '@/interfaces/product.interface';

interface ProductCheckListProps {
  selectedIds: string[];
  onValueChange: (selectedIds: string[]) => void;
  products: Product[];
  search?: string; // ← Agregado
}

export const ProductCheckList = ({
  selectedIds,
  onValueChange,
  products,
  search = "",
}: ProductCheckListProps) => {
  
  const visibleProducts = useMemo(() => {
    return products.filter(p =>
      p.referencia.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const allProductIds = visibleProducts.map(product => product._id);

  const allSelected =
    allProductIds.length > 0 &&
    allProductIds.every(id => selectedIds.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      // quitar seleccionados de los filtrados
      onValueChange(
        selectedIds.filter(id => !allProductIds.includes(id))
      );
    } else {
      // agregar filtrados sin duplicar
      onValueChange([...new Set([...selectedIds, ...allProductIds])]);
    }
  };

  const handleCheck = (id: string) => {
    if (selectedIds.includes(id)) {
      onValueChange(selectedIds.filter(pid => pid !== id));
    } else {
      onValueChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded">
      {/* Checkbox seleccionar todos (de los filtrados) */}
      {visibleProducts.length > 0 && (
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAll}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium">
            Seleccionar todos (filtrados)
          </span>
        </label>
      )}

      {/* Lista de productos filtrados */}
      {visibleProducts.map((product) => (
        <label
          key={product._id}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selectedIds.includes(product._id)}
            onChange={() => handleCheck(product._id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">
            {product.referencia || product._id}
          </span>
        </label>
      ))}

      {visibleProducts.length === 0 && (
        <p className="text-gray-500 text-sm italic">No hay coincidencias</p>
      )}
    </div>
  );
};
