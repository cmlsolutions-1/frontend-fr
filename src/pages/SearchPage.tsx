// src/pages/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

import { ProductGridItem } from '@/components/products/product-grid/ProductGridItem';
import { mockProducts } from '@/mocks/mock-products';
import { Product } from '@/interfaces/product.interface';
import { ProductGrid, Title } from '@/components';
import { CategoryFilterSidebar } from '@/components/filters/CategoryFilterSidebar';

export const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!query) return;

    const filtered = mockProducts.filter((product) =>
      product.title.toLowerCase().includes(query.toLowerCase()) ||
      product.id.toLowerCase().includes(query.toLowerCase())
    );

    setResults(filtered);
  }, [query]);

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