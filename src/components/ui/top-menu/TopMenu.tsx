import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Cambia la importación de Link
import { IoSearchOutline, IoCartOutline } from "react-icons/io5";
import { titleFont } from "@/config/fonts";
import { useCartStore } from "@/store";
import { useUIStore } from "@/store";
import clsx from "clsx";
import { FrLogo } from "@/assets/icons/logo";
import { ProductSearchDropdown } from "@/components/ui/ProductSearchDropdown";
import { UserInfo } from "../UserInfo";

export const TopMenu = () => {
  const openSideMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());

  const [loaded, setLoaded] = useState(false);
  const location = useLocation(); // Usa useLocation en lugar de usePathname

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <nav className="flex px-5 justify-between items-center w-full bg-white">
      {/* Logo */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/homePage">
            <FrLogo />
          </Link>
        </div>
        <div className="flex-1 mx-8 flex justify-center">
          <div className="relative w-full max-w-[600px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <IoSearchOutline />
            </div>
            <ProductSearchDropdown />
          </div>
        </div>
        <div className="flex items-center space-x-10">
          <UserInfo />
          {/* Barra separadora */}
          <div className="h-6 border-l border-gray-400 mx-4"></div>
        </div>
      </div>

      {/* Search, Cart, Menu */}
      <div className="flex items-center">
        <Link
          to={totalItemsInCart === 0 && loaded ? "/empty" : "/cart"} // Cambia href a to
          className="mx-2"
        >
          <div className="relative">
            {loaded && totalItemsInCart > 0 && (
              <span className="fade-in absolute text-xs px-1 rounded-full font-bold -top-2 -right-2 bg-blue-700 text-white">
                {totalItemsInCart}
              </span>
            )}
            <IoCartOutline className="w-5 h-5" />
          </div>
        </Link>

        <button
          onClick={openSideMenu}
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
        >
          Menú
        </button>
      </div>
    </nav>
  );
};
