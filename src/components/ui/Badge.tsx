// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void; // ✅ Añade esta línea
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children,
  onClick
}) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-300 text-gray-800 bg-white',
    secondary: 'bg-gray-100 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  };

  return (
    <span
      onClick={onClick} // ✅ Ahora puedes usar onClick
      className={`inline-block px-2 py-1 rounded text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};