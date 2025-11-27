import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 🔥 DEBOUNCE REAL (+ evita "no se encontraron" inmediato)
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

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="¿Qué estás buscando?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm && setShowResults(true)}
          className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 
                 focus:outline-none focus:ring-1 focus:ring-[#F4C048] focus:border-[#F2B318] 
                 text-sm text-center"
        />
        <IoSearchOutline className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
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
