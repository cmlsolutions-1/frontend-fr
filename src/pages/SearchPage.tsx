// src/pages/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

import { searchProducts } from '@/services/products.service';
import { Product } from '@/interfaces/product.interface';
import { ProductGrid, Title } from '@/components';
import { CategoryFilterSidebar } from '@/components/filters/CategoryFilterSidebar';

export const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const products = await searchProducts(query);
        setResults(products);
      } catch (error) {
        console.error("Error al buscar productos:", error);
        setError("Error al cargar los resultados de búsqueda");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Buscando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Title title={`Búsqueda: ${query}`} subtitle={`${results.length} resultados encontrados`} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Columna izquierda - Filtro de categorías */}
        <div className="md:col-span-1">
          <CategoryFilterSidebar />
        </div>

      {/* Columna derecha - Resultados de búsqueda */}
      <div className="md:col-span-3">
      {results.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No se encontraron productos.</p>
        </div>
      ) : (
        <div className="md:col-span-3">
            <ProductGrid products={results} />
        </div>
      )}
        </div>
      </div>
    </div>
  );
};