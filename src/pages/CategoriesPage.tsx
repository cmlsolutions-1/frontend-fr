//src/pages/CategoriesPage.tsx

import { Link } from "react-router-dom";
import React from "react";
import { displayCategory } from "@/utils/formatters";
import { categoryImages } from "@/utils/categoryImages";
import { useCategoryStore } from "@/store/useCategoryStore";

export const revalidate = 3600;

//esto se usa sin el backend
// export const CategoriesPage = () => {
//   const categories = mockCategories;


//esto se usa con el backend
export const CategoriesPage = () => {
  const { categories, loadCategories } = useCategoryStore();
  
  React.useEffect(() => {
    loadCategories(); // Carga desde el backend o usa mock si falla
  }, []);

  if (categories.length === 0) {
    return <p>Cargando categorías...</p>;
  }


  return (
    <main className="px-10">
      <h1 className="text-2xl font-bold mb-6">Categorías disponibles</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.name}`}
            className="border p-4 rounded-xl shadow hover:shadow-lg transition-all text-center hover:text-blue-600 font-semibold bg-white"
          >
            <div className="relative w-full h-32 mb-3 rounded-md overflow-hidden">
              <img
                src={categoryImages[category.name] || "/categories/default.png"}
                alt={category.name}
                className="object-contain w-full h-full"
              />
            </div>
            <span className="block capitalize">
              {displayCategory(category.name)}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
};
