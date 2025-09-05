// src/components/ui/ProductSearchDropdown.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 🔁 Agrega useNavigate
import { searchProducts } from '@/services/products.service';
import type { Product } from '@/interfaces/product.interface';
import { IoSearchOutline } from 'react-icons/io5';

interface Props {
  onClose?: () => void;
}

export const ClientSearch = ({ onClose }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Para navegar al presionar Enter

  useEffect(() => {
    const searchProductsDebounced = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Debounce - esperar un poco antes de buscar
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const products = await searchProducts(searchTerm);
        // Limitar resultados para mejor UX
        setResults(products.slice(0, 8));
      } catch (error) {
        console.error("Error en búsqueda:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchProductsDebounced();
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchTerm.trim()) {
        navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
        setShowResults(false);
        if (onClose) onClose();
      }
    }
  };

  const handleClickOutside = () => {
    setShowResults(false);
    if (onClose) onClose();
  };

  // ✅ Función para formatear el texto de búsqueda
  const formatProductText = (product: Product): string => {
    const reference = product.referencia || '';
    const detail = product.detalle || '';
    
    // Limitar longitud para mejor visualización
    const shortDetail = detail.length > 50 ? detail.substring(0, 50) + '...' : detail;
    
    return reference ? `${reference} - ${shortDetail}` : shortDetail;
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por código o nombre..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onKeyDown={handleKeyDown} // ✅ Maneja Enter
          onFocus={() => setShowResults(true)}
          className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0099CC] focus:border-[#0099CC] text-sm"
        />
        <IoSearchOutline className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      </div>

      {/* Resultados dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200">
          <ul>
            {results.map((product) => (
              <li key={product._id}>
                <Link
                  to={`/product/${product._id}`}
                  onClick={handleClickOutside}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="font-medium">{product.detalle}</span>
                  <span className="ml-auto text-xs text-gray-500">ID: {product._id}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mensaje sin resultados */}
      {showResults && results.length === 0 && searchTerm !== '' && (
        <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md border border-gray-200 p-3 text-sm text-gray-500">
          No se encontraron productos.
        </div>
      )}
    </div>
  );
};