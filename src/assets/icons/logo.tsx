// src/components/ui/FrLogo.tsx
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

export const FrLogo: React.FC<LogoProps> = ({ width = 150, height = 50 }) => {
  return (
    <img
      src="/FR.png"
      alt="Ferrelectricos Restrepo"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
};

