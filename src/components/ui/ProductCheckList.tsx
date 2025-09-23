// src/components/ui/ProductCheckList.tsx
import React, { useState, useEffect } from "react";
import { Product } from '@/interfaces/product.interface';


interface ProductCheckListProps {
  selectedIds: string[];
  onValueChange: (selectedIds: string[]) => void;
  products: Product[];
  
}


export const ProductCheckList = ({
  selectedIds,
  onValueChange,
  products,
}: ProductCheckListProps) => {
  
  const [localSelected, setLocalSelected] = useState<string[]>(selectedIds || []);
  const allProductIds = products.map(product => product._id);
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
  }, [localSelected,selectedIds]);

 const handleSelectAll = () => {
    setLocalSelected(allSelected ? [] : [...allProductIds]);
  };
  
  const handleCheck = (id: string) => {
    setLocalSelected(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
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

      {products.map((product) => (
        
        
        <label
          key={product._id}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={localSelected.includes(product._id)}
            onChange={() => handleCheck(product._id)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm">
            {product.referencia || product._id}
          </span>
        </label>
      ))}
    </div>
  );
};
