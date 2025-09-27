// src/components/filters/CategoryFilterSidebar.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockCategories } from "@/mocks/mock-categories";
import {
  RiNodeTree,
  RiBox3Fill,
  RiArrowRightSLine,
} from "react-icons/ri";

export const CategoryFilterSidebar = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  const navigate = useNavigate();

  // Marcas predefinidas
  const brands = ["ELITE", "DEWALT", "TOTAL", "TRUPER"];

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Manejar cambio de marca
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };

  // Verificar si una categoría está seleccionada
  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  // Verificar si una marca está seleccionada
  const isBrandSelected = (brand: string) => {
    return selectedBrands.includes(brand);
  };

  // Navegar a la página de productos filtrados (puedes adaptar según tu estructura)
  const applyFilters = () => {
    // Aquí puedes implementar la lógica para aplicar los filtros
    // Por ejemplo, redirigir con parámetros de query o actualizar el estado global
    console.log("Categorías seleccionadas:", selectedCategories);
    console.log("Marcas seleccionadas:", selectedBrands);
    
    // Ejemplo de navegación con parámetros (ajusta según tu estructura)
    if (selectedCategories.length > 0) {
      navigate(`/category/${selectedCategories[0]}`); // Tomar la primera categoría seleccionada
    } else {
      navigate("/"); // Volver a la página principal si no hay categorías
    }
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-800 mb-3">Filtrar por:</h3>

      {/* Line Separator */}
      <div className="w-full h-px bg-gray-200 my-4" />

      {/* Filtro de Categorías */}
      <div className="mb-4">
        <button
          onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium flex items-center gap-4">
            <RiNodeTree className="text-primary" />
            Categorías
          </span>
          <RiArrowRightSLine
            className={`mt-1 ${showCategoryMenu && "rotate-90"} transition-all`}
          />
        </button>

        {showCategoryMenu && (
          <div className="mt-2 pl-2 space-y-2 max-h-60 overflow-y-auto">
            {mockCategories.map((category) => (
              <label 
                key={category.id} 
                className="flex items-center space-x-3 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isCategorySelected(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-6 h-6 object-cover rounded-full"
                />
                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Line Separator */}
      <div className="w-full h-px bg-gray-200 my-4" />

      {/* Filtro de Marcas */}
      <div>
        <button
          onClick={() => setShowBrandMenu(!showBrandMenu)}
          className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium flex items-center gap-4">
            <RiBox3Fill className="text-primary" />
            Marcas
          </span>
          <RiArrowRightSLine
            className={`mt-1 ${showBrandMenu && "rotate-90"} transition-all`}
          />
        </button>

        {showBrandMenu && (
          <div className="mt-2 pl-2 space-y-2">
            {brands.map((brand) => (
              <label 
                key={brand} 
                className="flex items-center space-x-3 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isBrandSelected(brand)}
                  onChange={() => handleBrandChange(brand)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="mt-4 space-y-2">
        <button
          onClick={applyFilters}
          disabled={selectedCategories.length === 0 && selectedBrands.length === 0}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
            selectedCategories.length > 0 || selectedBrands.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Aplicar Filtros
        </button>
        
        <button
          onClick={clearAllFilters}
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Filtros aplicados */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium text-gray-700 mb-2">Filtros aplicados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => {
              const category = mockCategories.find(cat => cat.id === categoryId);
              return category ? (
                <span key={categoryId} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {category.name}
                  <button 
                    onClick={() => handleCategoryChange(categoryId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            {selectedBrands.map(brand => (
              <span key={brand} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {brand}
                <button 
                  onClick={() => handleBrandChange(brand)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};