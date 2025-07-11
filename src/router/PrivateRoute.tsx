// src/router/PrivateRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store"; // usa el store correcto

interface Props {
  children: JSX.Element;
  roles?: string[]; // opcional para protección por roles
}

export const PrivateRoute = ({ children, roles }: Props) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/404" />; // o cualquier página de acceso denegado
  }

  return children;
};
