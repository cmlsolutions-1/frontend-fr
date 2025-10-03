//src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pagination, ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { filterProducts } from "@/services/products.service";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const PRODUCTS_PER_PAGE = 51;

  // Obtener parámetros de la URL
  const categories = searchParams.get('categories')?.split(',') || [];
  const brands = searchParams.get('brands')?.split(',') || [];
  const search = searchParams.get('search') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1');

  
  
  // Cargar productos con filtros - usar una variable de control para evitar recargas innecesarias
  useEffect(() => {
    let isMounted = true; // Variable para controlar si el componente sigue montado

    const fetchFilteredProducts = async () => {
      if (!isMounted) return; // Si no está montado, no hacer nada
      
      setLoadingProducts(true);
      setError(null);
      
      try {
        const response = await filterProducts({
          page: pageFromUrl,
          limit: PRODUCTS_PER_PAGE,
          search,
          brands,
          categories
        });
        
        if (isMounted) { // Solo actualizar si sigue montado
          setProducts(response.products);
          setTotalPages(response.totalPages);
        }
      } catch (err) {
        console.error("Error al filtrar productos:", err);
        if (isMounted) { // Solo actualizar si sigue montado
          setError("Error al cargar los productos");
          setProducts([]);
        }
      } finally {
        if (isMounted) { // Solo actualizar si sigue montado
          setLoadingProducts(false);
        }
      }
    };

    fetchFilteredProducts();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [categories.join(','), brands.join(','), search, pageFromUrl]); // Convertir arrays a strings para la dependencia

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    
    if (categories.length > 0) {
      params.set('categories', categories.join(','));
    }
    
    if (brands.length > 0) {
      params.set('brands', brands.join(','));
    }
    
    if (search) {
      params.set('search', search);
    }
    
    if (newPage > 1) {
      params.set('page', newPage.toString());
    }
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  if (loadingProducts && products.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Title
        title="Distribucciones Ferrelectricos Restrepo"
        subtitle="Todos los productos"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Columna izquierda - Filtros */}
        <div className="md:col-span-1">
          <CategoryFilterSidebar />
        </div>

        {/* Columna derecha - Productos */}
        <div className="md:col-span-3">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-600">
              No se encontraron productos con los filtros seleccionados.
            </p>
          ) : (
            <>
              <ProductGrid products={products} />
              <Pagination
                totalPages={totalPages}
                currentPage={pageFromUrl}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;