// src/components/filters/CategoryFilterSidebar.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { mockCategories } from "@/mocks/mock-categories";
import {
  RiBarChart2Line,
  RiEarthLine,
  RiCalendarTodoLine,
  RiCustomerService2Line,
  RiLogoutCircleLine,
  RiArrowRightSLine,
  RiMenu3Line,
  RiCloseLine,
  RiBox3Fill,
  RiDiceLine,
  RiNodeTree,
} from "react-icons/ri";

export const CategoryFilterSidebar = () => {
  const [showSubmenu, setShowmenu] = useState(false);
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">Filtrar por:</h3>

      {/* Line Separator */}
      <div className="w-full h-px bg-gray-200 my-4" />

      <button
        onClick={() => setShowmenu(!showSubmenu)}
        className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors"
      >
        <span className="font-medium flex items-center gap-4">
          <RiNodeTree className="text-primary" />
          Categorías
        </span>
        <RiArrowRightSLine
          className={`mt-1 ${showSubmenu && "rotate-90"} transition-all`}
        />
      </button>

      {/* <h3 className="font-medium text-gray-800 mb-3">Categorías</h3> */}

      {/* <ul className="space-y-2 max-h-60 overflow-y-auto"> */}
      <ul className={`${showSubmenu ? "h-[130px]" : "h-0"} overflow-y-auto`}>
        {mockCategories.map((category) => (
          <li key={category.id}>
            <Link
              to={`/category/${category.id}`}
              className="flex items-center space-x-3 px-2 py-1 hover:bg-gray-100 rounded"
            >
              {/* Imagen */}
              <img
                src={category.image}
                alt={category.name}
                className="w-6 h-6 object-cover rounded-full mr-2"
              />
              {/* Nombre */}
              <span className="text-sm">{category.name}</span>
            </Link>
          </li>
        ))}
        {/* Ver todas las categorias */}
        <Link to={`/categories/}`}>
          {/* Nombre */}
          <span className="font-medium text-sm">Ver todo</span>
        </Link>
      </ul>
      {/* Line Separator */}
      <div className="w-full h-px bg-gray-200 my-4" />

     {/*  <div>
        <Link
          to="/proximosContenedores"
          className="font-medium flex items-center gap-4 py-2 px-4 rounded-lg hover:bg-secondary-900 transition-colors"
        >
          <RiDiceLine className="text-primary" />
          Proximos contenedores
        </Link>
      </div> */}
    </div>
  );
};
