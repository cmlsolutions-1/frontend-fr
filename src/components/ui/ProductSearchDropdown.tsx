//src/components/ui/ProductSearchDropdown.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchProducts } from '@/services/products.service';
import type { Product } from '@/interfaces/product.interface';
import { IoSearchOutline } from 'react-icons/io5';


interface Props {
  onClose?: () => void;
}

export const ProductSearchDropdown = ({ onClose }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detectar móvil para placeholder corto
  const [isSmall, setIsSmall] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // DEBOUNCE REAL (+ evita "no se encontraron" inmediato)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const products = await searchProducts(searchTerm);
        setResults(products.slice(0, 8));
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
        setShowResults(true);
      }
    }, 450); // más suave y más rápido

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // CERRAR DROPDOWN CUANDO HACES CLIC AFUERA
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/homePage?search=${encodeURIComponent(searchTerm)}`);

      setShowResults(false);
      onClose?.();
    }
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    onClose?.();
  };

  const clearSearch = () => {
    setSearchTerm("");
    setShowResults(false);

    const params = new URLSearchParams(location.search);
    params.delete("search");
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="relative w-full" ref={containerRef}>
  <div className="relative">
  <input
  type="text"
  placeholder={isSmall ? "Buscar..." : "¿Qué estás buscando?"}
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleKeyDown}
  onFocus={() => searchTerm && setShowResults(true)}
  className="
    block w-full
    pl-11 pr-12 sm:pr-36
    py-2
    border border-gray-300 rounded-full bg-gray-50
    focus:outline-none focus:ring-1 focus:ring-[#F4C048] focus:border-[#F2B318]
    text-sm
    text-left sm:text-center
    placeholder:text-gray-400
  "
/>

    <IoSearchOutline className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
    
    {/* Botón cerrar: en móvil SOLO X, en desktop texto + X */}
    {searchTerm && (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
      <span className="hidden sm:inline text-xs text-gray-500 whitespace-nowrap">
        Cerrar búsqueda
      </span>
      <button
              type="button"
              onClick={clearSearch}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-full
                text-gray-500 hover:text-gray-700
                hover:bg-gray-200 transition
              "
              aria-label="Cerrar búsqueda"
              title="Cerrar búsqueda"
            >
          <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    )}
  </div>


      {/*Dropdown resultados */}
      {/* {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200">
          {loading ? (
            <div className="p-3 text-sm text-gray-500 text-center">Buscando...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((product) => (
                <li key={product._id}>
                  <div
                    onClick={() => handleResultClick(product._id)}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <span className="font-medium">{product.detalle}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-sm text-gray-500 text-center">
              No se encontraron productos
            </div>
          )}
        </div>
      )//aca
      
      } */}
    </div>
  );
};
