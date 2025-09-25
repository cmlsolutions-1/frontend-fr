// src/components/ui/SelectedProductsList.tsx
import React from 'react';


interface Product {
  _id: string;
  reference?: string;
  description?: string;
}

interface Props {
  selectedProducts: Product[];
  onRemove: (id: string) => void;
}

export const SelectedProductsList: React.FC<Props> = ({
  selectedProducts,
  onRemove,

}) => {
  if (selectedProducts.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700">
        Productos seleccionados:
      </h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedProducts.map((product) => (
          <span
            key={product._id} 
            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs cursor-pointer hover:bg-gray-200"
            onClick={() => onRemove(product._id)}
          >
            {product.reference || product.description || product._id}
            <span className="ml-2">×</span>
          </span>
        ))}
      </div>
    </div>
  );
};