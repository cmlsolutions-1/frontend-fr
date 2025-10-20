// src/pages/SearchPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { filterProducts } from '@/services/products.service';
import { Product } from '@/interfaces/product.interface';
import { Pagination, ProductGrid, Title } from '@/components';
import { CategoryFilterSidebar } from '@/components/filters/CategoryFilterSidebar';

export const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('query') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1');
  
  const [results, setResults] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (!query) {
        setResults([]);
        setTotalPages(1);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await filterProducts({
          page: pageFromUrl,
          limit: 21, // Ajusta según tu preferencia
          search: query,
          brands: [],
          categories: []
        });
        
        setResults(response.products);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error al buscar productos:", error);
        setError("Error al cargar los resultados de búsqueda");
        setResults([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [query, pageFromUrl]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('query', query);
    if (newPage > 1) {
      params.set('page', newPage.toString());
    }
    navigate(`/search?${params.toString()}`);
  };

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
    <div className="container mx-auto px-4 py-6 space-y-6 mt-[80px]">
      <Title 
        title={`Búsqueda: ${query}`} 
        subtitle={`${results.length} resultados encontrados`} 
      />

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
            <>
              <ProductGrid products={results} />
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={pageFromUrl}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};