// src/components/ui/SelectProduct.tsx
import React from 'react';
import { mockProducts } from '@/mocks/mock-products';

interface Option {
  value: string;
  label: string;
}

interface SelectProductProps {
  selectedIds: string[];
  onValueChange: (values: string[]) => void;
}

export const SelectProduct: React.FC<SelectProductProps> = ({ selectedIds, onValueChange, }) => {
  const options = mockProducts.map(product => ({
    value: product.id,
    label: `${product.title} (${product.id})`,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    onValueChange(selected);
  };

  return (
    <select
      multiple
      size={5}
      className="w-full p-2 border border-gray-300 rounded"
      onChange={handleChange}
      value={selectedIds}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};