// src/components/ui/SelectedProductsList.tsx
import React from 'react';
import { mockProducts } from '@/mocks/mock-products';

interface Props {
  selectedIds: string[];
  onRemove: (id: string) => void;
}

export const SelectedProductsList: React.FC<Props> = ({ selectedIds, onRemove }) => {
  if (selectedIds.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700">Productos seleccionados:</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedIds.map(id => {
          const product = mockProducts.find(p => p.id === id);
          return (
            <span
              key={id}
              className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs cursor-pointer hover:bg-gray-200"
              onClick={() => onRemove(id)}
            >
              ID: {id}
              <span className="ml-2">×</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};