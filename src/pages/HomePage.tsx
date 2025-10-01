//src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { Pagination, ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { getProducts } from "@/services/products.service";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // const PRODUCTS_PER_PAGE = 8; // Define cuántos productos mostrar por página
  const PRODUCTS_PER_PAGE = 18;
  
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        // Total de páginas calculado en base a los productos
        setTotalPages(Math.ceil(data.length / PRODUCTS_PER_PAGE)); 
      } catch (error) {
        console.error("Error al traer productos:", error);
      } finally {
        setLoadingProducts(false); // Finalizar loading
      }
    };
  
    fetchProducts();
  }, [currentPage]);

// Productos que se deben mostrar en la página actual
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  
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

        {/* Columna derecha - Contenido */}
        <div className="md:col-span-3">
          <ProductGrid products={currentProducts} />
          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage} 
            onPageChange={setCurrentPage} 
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
