import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Cambia la importación de Link
import { IoSearchOutline, IoCartOutline } from "react-icons/io5";
import { titleFont } from "@/config/fonts";
import { useCartStore } from "@/store";
import { useUIStore } from "@/store";
import clsx from "clsx";
import { useAuthStore } from "@/store/auth-store"; 
import { FrLogo } from "@/assets/icons/logo";
import { LuMenu } from "react-icons/lu";
import { ProductSearchDropdown } from "@/components/ui/ProductSearchDropdown";
import { UserInfo } from "../UserInfo";

export const TopMenu = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());
  const { user } = useAuthStore();

  const [loaded, setLoaded] = useState(false);
  const location = useLocation(); // Usa useLocation en lugar de usePathname

  useEffect(() => {
    setLoaded(true);
  }, []);

  const isClient = user?.role === "Client";

  return (
    <nav className="fixed top-0 left-0 z-40 flex px-5 py-3 md:py-1 justify-between items-center w-full bg-white shadow-md">
      {/* Logo */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
      <div className="flex items-center">
            <Link to="/homePage">
              {/* Logo grande (desktop) */}
              <div className="hidden md:block">
                <FrLogo />
              </div>

              {/* Logo compacto (móvil) */}
              <div className="block md:hidden">
                <img
                  src="/FRsolo.png"
                  alt="Ferrelectricos Restrepo"
                  className="w-12 h-auto" // puedes ajustar tamaño
                />
              </div>
            </Link>
          </div>


        {/* Search - Oculta en pantallas pequeñas */}
        <div className="flex-1 max-w-[400px] sm:max-w-[500px] md:max-w-[600px] mx-2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <IoSearchOutline />
            </div>
            <ProductSearchDropdown />
          </div>
        </div>

        
        {/* User Info visible en móvil (simple) */}
          {/* Mobile: ícono + nombre pequeño */}
          <div className="flex md:hidden items-center mr-3">
            <UserInfo mobile />
          </div>

          {/* Desktop: logo + info */}
          <div className="hidden md:flex items-center space-x-4 order-2">
            <UserInfo />
            <div className="h-6 border-l border-gray-400 mx-2"></div>
          </div>

      </div>

      {/* Search, Cart, Menu - Compacto para móviles */}
      <div className="flex items-center space-x-2 order-4 md:order-3 mt-2 md:mt-0">
        {isClient && (
        <Link
          to={totalItemsInCart === 0 && loaded ? "/empty" : "/cart"}
          className="relative"
        >
          <div className="relative">
            {loaded && totalItemsInCart > 0 && (
              <span className="absolute text-xs px-1 rounded-full font-bold -top-2 -right-2 bg-blue-700 text-white">
                {totalItemsInCart}
              </span>
            )}
            <IoCartOutline className="w-5 h-5" />
          </div>
        </Link>
        )}

        <button
          onClick={openSideMenu}
          className="p-2 rounded-md transition-all hover:bg-gray-100 flex items-center gap-2"
        >
          <LuMenu size={22} className="text-gray-700" />
          {/* ocultar texto en pantallas pequeñas */}
          <span className="font-medium text-gray-700 hidden md:inline">Menú</span>
        </button>
      </div>
    </nav>
  );
};
