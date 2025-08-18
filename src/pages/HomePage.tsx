//src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { getPaginatedMockProductsWithImages } from "@/mocks/getPaginatedMockProducts";
import { Pagination, ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { getProducts } from "@/services/products.service";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);


  //ESTE ES DEL BACKEND----------------------------------------

  //habilitar este y cerrar el otro de los mocks DEL 1-
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setTotalPages(1); // No hay paginación en el backend aún
      } catch (error) {
        console.error("Error al traer productos:", error);
      }
    };
  
    fetchProducts();
  }, [currentPage]);


  //HASTA ACA----------------------------------------

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
          <ProductGrid products={products} />
          <Pagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
