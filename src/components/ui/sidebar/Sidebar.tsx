import React from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoShirtOutline,
  IoTicketOutline,
  IoLogoBuffer,
} from "react-icons/io5";
import { BiSolidOffer } from "react-icons/bi";

import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui/ui-store";

export const Sidebar = () => {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);
  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "Admin";
  const isSalesPerson = user?.role === "SalesPerson";
  const isClient = user?.role === "Client";
  //const role = user?.role;

  const handleLogout = () => {
    logout(); // Limpia el estado
    closeMenu(); // Cierra el menú
    navigate("/"); // Redirige al login
  };

  return (
    <div>
      {/* Background black */}
      {isSideMenuOpen && (
        <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30" />
      )}

      {/* Blur */}
      {isSideMenuOpen && (
        <div
          onClick={closeMenu}
          className="fixed top-0 left-0 w-screen h-screen z-10 bg-black bg-opacity-30 backdrop-blur-sm"
        />
      )}

      {/* Sidemenu */}
      <nav
        className={clsx(
          "fixed right-0 top-0 h-screen bg-white z-20 shadow-2xl transform transition-transform duration-300 overflow-y-auto",
          "w-full max-w-xs sm:max-w-sm md:max-w-md", // Responsivo
          {
            "translate-x-full": !isSideMenuOpen,
            "translate-x-0": isSideMenuOpen,
          }
        )}
      >
        <IoCloseOutline
          size={50}
          className="absolute top-4 right-4 cursor-pointer text-gray-700"
          onClick={() => closeMenu()}
        />

        {/* Menú */}
        <div className="pt-16 px-6 pb-10 flex flex-col space-y-6">
        {isAuthenticated && (
          <>
            <Link
              to="/profile"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoPersonOutline size={30} />
              <span className="ml-3 text-lg">Perfil</span>
            </Link>

            
          </>
        )}

        {isAuthenticated && (
          <button
            className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            //onClick={() => logout()}
            onClick={handleLogout}
          >
            <IoLogOutOutline size={30} />
            <span className="ml-3 text-lg">Salir</span>
          </button>
        )}

        {!isAuthenticated && (
          <Link
            to="/"
            className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            onClick={() => closeMenu()}
          >
            <IoLogInOutline size={30} />
            <span className="ml-3 text-lg">Ingresar</span>
          </Link>
        )}
        {isClient&& (
          <>
            {/* Line Separator */}
            <div className="w-full h-px bg-gray-200 my-10" />
            <hr className="my-4 border-gray-300" />

            <Link
              to="/orders"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoTicketOutline size={30} />
              <span className="ml-3 text-lg">Órdenes</span>
            </Link>

          </>
        )}
        {isSalesPerson && (
          <>
            {/* Line Separator */}
            <div className="w-full h-px bg-gray-200 my-10" />
            <hr className="my-4 border-gray-300" />

            <Link to="/salesPerson/user-salesPerson" onClick={() => closeMenu()} className="flex items-center p-2 hover:bg-gray-100 rounded transition-all">
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-lg">Gestión de Clientes</span>
            </Link>
            <Link
              to="/salesPerson/orders"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoTicketOutline size={30} />
              <span className="ml-3 text-lg">Mis Pedidos</span>
            </Link>

          </>
        )}

        {isAdmin && (
          <>
            {/* Line Separator */}
            <div className="w-full h-px bg-gray-200 my-10" />
            <hr className="my-4 border-gray-300" />

            {/* <Link
              to="/admin/products"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoShirtOutline size={30} />
              <span className="ml-3 text-lg">Productos</span>
            </Link> */}

            {/* <Link
              to="/admin/containers"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoLogoBuffer size={30} />
              <span className="ml-3 text-lg">Contenedores</span>
            </Link> */}

            <Link
              to="/admin/orders"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoTicketOutline size={30} />
              <span className="ml-3 text-lg">Lista Pedidos</span>
            </Link>

            <Link
              to="/promociones"
              onClick={() => closeMenu()}
              className="flex items-center p-2 hover:bg-gray-100 rounded transition-all"
            >
              <BiSolidOffer size={30} />
              <span className="ml-3 text-lg">Gestion Promociones</span>
            </Link>

            <Link to="/admin/user-management" onClick={() => closeMenu()} className="flex items-center p-2 hover:bg-gray-100 rounded transition-all">
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-lg">Gestión de Usuarios</span>
            </Link>

          </>
        )}
        </div>
      </nav>
    </div>
  );
};
