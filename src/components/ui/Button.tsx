// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'sm' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'rounded px-4 py-2 font-semibold transition-colors focus:outline-none';

  const variantClasses = {
    default: 'bg-[#F2B318] hover:bg-[#F4C048] text-white',
    outline: 'bg-transparent border border-black text-black-600 hover:bg-[#555554]',
    ghost: 'hover:bg-gray-100 text-gray-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    lg: 'text-lg py-2 px-6'
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};