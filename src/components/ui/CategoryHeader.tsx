// src/components/ui/CategoryHeader.tsx

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "@/store";
import { useUIStore } from "@/store";
import clsx from "clsx";

import { UserInfo } from "./UserInfo";

export const CategoryHeader = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());

  const [loaded, setLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-2 py-3 flex items-center">
        {/* Usuario */}
        <div className="flex items-center space-x-4">
          <UserInfo />
          {/* Barra separadora */}
          <div className="h-6 border-l border-gray-400 mx-4"></div>
        </div>

        {/* Links de navegación */}
        <div className="flex-1 flex justify-center space-x-3"></div>

        <Link
          className={clsx(
            "p-2 rounded-md transition-all hover:bg-gray-100",
            location.pathname === "/categories" && "bg-gray-200"
          )}
          to="/categories"
        >
          Categorias
        </Link>
        <Link
          className={clsx(
            "p-2 rounded-md transition-all hover:bg-gray-100",
            location.pathname === "/proximosContenedores" && "bg-gray-200"
          )}
          to="/proximosContenedores"
        >
          Proximos contenedores
        </Link>
        <Link
          className={clsx(
            "p-2 rounded-md transition-all hover:bg-gray-100",
            location.pathname === "/mas" && "bg-gray-200"
          )}
          to="/gender/kid" // Cambia href a to
        >
          Más
        </Link>
      </div>
    </nav>
  );
};
