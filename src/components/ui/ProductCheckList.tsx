// src/components/ui/ProductCheckList.tsx
import React, { useState, useEffect } from "react";
import { mockProducts } from "@/mocks/mock-products";

interface ProductCheckListProps {
  selectedIds: string[];
  onValueChange: (selectedIds: string[]) => void;
}

export const ProductCheckList = ({
  selectedIds,
  onValueChange,
}: ProductCheckListProps) => {
  
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds || []);
  const allProductIds = mockProducts.map(product => product.id);
  const allSelected = localSelected.length === allProductIds.length;

  useEffect(() => {
    if (selectedIds && Array.isArray(selectedIds)) {
      setLocalSelected([...selectedIds]); // Copia props al estado local
    }
  }, [selectedIds]);

  
  useEffect(() => {
    if (
      localSelected.length !== selectedIds.length ||
      !localSelected.every((id) => selectedIds.includes(id))
    ) {
      onValueChange(localSelected);
    }
  }, [localSelected]);

  const handleSelectAll = () => {
    if (allSelected) {
      setLocalSelected([]);
    } else {
      setLocalSelected([...allProductIds]);
    }
  };
  
  const handleCheck = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-300 rounded">
{/* Checkbox para seleccionar todos */}
<label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium">Seleccionar todos</span>
      </label>

      {mockProducts.map((product) => (
        
        
        <label
          key={product.id}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={localSelected.includes(product.id)}
            onChange={() => handleCheck(product.id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">{product.id}</span>
        </label>
      ))}
    </div>
  );
};
