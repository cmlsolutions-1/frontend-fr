import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { user } = useAuthStore();

  // Si no hay usuario autenticado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no está permitido
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/homePage" replace />;
  }

  // Si cumple los requisitos, muestra el contenido
  return <>{children}</>;
};
