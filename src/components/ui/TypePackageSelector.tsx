// src/components/ui/TypePackageSelector.tsx
import React from 'react';

interface TypePackageSelectorProps {
  value?: 'unidad' | 'master';
  onChange: (value: 'unidad' | 'master') => void;
}

export const TypePackageSelector: React.FC<TypePackageSelectorProps> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as 'unidad' | 'master')}
      className="w-full p-2 border border-gray-300 rounded"
    >
      <option value="unidad">Unidad</option>
      <option value="master">Master</option>
    </select>
  );
};