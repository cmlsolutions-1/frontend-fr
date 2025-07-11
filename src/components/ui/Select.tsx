// src/components/ui/Select.tsx
import React from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  onValueChange: (value: string) => void;
  value?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, onValueChange, value, placeholder = 'Selecciona...' }) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded"
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};