// src/components/filters/CategoryFilterSidebar.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockCategories } from "@/mocks/mock-categories";
import {
  RiNodeTree,
  RiBox3Fill,
  RiArrowRightSLine,
} from "react-icons/ri";
import { getBrands } from "@/services/brands.service";

export const CategoryFilterSidebar = () => {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showBrandMenu, setShowBrandMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]); // Seguimos usando IDs
  const [allBrands, setAllBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Cargar marcas desde el backend
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const brands = await getBrands();
        setAllBrands(brands);
      } catch (error) {
        
        setAllBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Cargar filtros desde la URL al montar el componente
  useEffect(() => {
    const categoriesFromUrl = searchParams.get('categories')?.split(',') || [];
    const brandsFromUrl = searchParams.get('brands')?.split(',') || [];
    
    setSelectedCategories(categoriesFromUrl);
    setSelectedBrands(brandsFromUrl);
  }, []); // Solo una vez al montar

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  // Manejar cambio de marca
  const handleBrandChange = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(b => b !== brandId) 
        : [...prev, brandId]
    );
  };

  // Verificar si una categoría está seleccionada
  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  // Verificar si una marca está seleccionada
  const isBrandSelected = (brandId: string) => {
    return selectedBrands.includes(brandId);
  };

  // Aplicar filtros
  const applyFilters = () => {

    
    const params = new URLSearchParams();
    
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    
    if (selectedBrands.length > 0) {
      params.set('brands', selectedBrands.join(','));
    }
    
    // Mantener la búsqueda si existe
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      params.set('search', currentSearch);
    }
    
    // Siempre mantener la página en 1 al aplicar filtros
    params.set('page', '1');
    
    navigate(`?${params.toString()}`);
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    const params = new URLSearchParams();
    // Mantener solo la búsqueda si existe
    const currentSearch = searchParams.get('search');
    if (currentSearch) {
      params.set('search', currentSearch);
    }
    navigate(`/homePage?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-[calc(100vh-150px)] max-h-[600px] overflow-y-auto">
      <h3 className="font-medium text-gray-800 mb-3 sticky top-0 bg-white z-10">Filtrar por:</h3>

      {/* Line Separator */}
      <div className="w-full h-px bg-gray-200 my-4" />

      {/* Filtro de Categorías */}
      <div className="mb-4">
        <button
          onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          className="w-full flex items-center justify-between py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-medium flex items-center gap-4">
            <RiNodeTree className="text-black" />
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
                  className="w-4 h-4 accent-[#F4C048] rounded focus:ring-yellow-500"
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
            <RiBox3Fill className="text-black" />
            Marcas
          </span>
          <RiArrowRightSLine
            className={`mt-1 ${showBrandMenu && "rotate-90"} transition-all`}
          />
        </button>

        {showBrandMenu && (
          <div className="mt-2 pl-2 space-y-2 max-h-60 overflow-y-auto">
            {loadingBrands ? (
              <div className="text-center py-2 text-gray-500">Cargando marcas...</div>
            ) : allBrands.length > 0 ? (
              allBrands.map((brand) => (
                <label 
                  key={brand.code} 
                  className="flex items-center space-x-3 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isBrandSelected(brand.code)}
                    onChange={() => handleBrandChange(brand.code)}
                    className="w-4 h-4 accent-[#F4C048] rounded focus:ring-yellow-500"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))
            ) : (
              <div className="text-center py-2 text-gray-500">No hay marcas disponibles</div>
            )}
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
              ? "bg-[#F4C048] text-white hover:bg-[#F2B318]"
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
        <div className="mt-4 p-3 bg-yellow-50 rounded-md sticky bottom-0 z-10">
          <h4 className="font-medium text-gray-700 mb-2">Filtros aplicados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => {
              const category = mockCategories.find(cat => cat.id === categoryId);
              return category ? (
                <span key={categoryId} className="inline-flex items-center px-2 py-1 bg-[#F5C85C] text-black-800 rounded text-xs">
                  {category.name}
                  <button 
                    onClick={() => handleCategoryChange(categoryId)}
                    className="ml-1 text-black-600 hover:text-black-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            {selectedBrands.map(brandCode => {
              const brand = allBrands.find(b => b.code === brandCode); // Buscar por code
              return brand ? (
                <span 
                  key={brandCode} 
                  className="inline-flex items-center px-2 py-1 bg-[#F5C85C] text-black-800 rounded text-xs"
                >
                  {brand.name}   {/* Mostrar el nombre de la marca */}
                  <button 
                    onClick={() => handleBrandChange(brandCode)} // Sigue quitando por code
                    className="ml-1 text-black-600 hover:text-black-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};