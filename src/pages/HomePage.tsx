//src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pagination, ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { filterProducts } from "@/services/products.service";
import { ArrowUp } from "lucide-react";

const HomePage = () => {

  console.log('HomePage rendering');

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

  //boton flotante para subir al inicio
  const [showScrollTop, setShowScrollTop] = useState(false);

  
  // Detectar scroll para mostrar el botón para subir arriba
   // Detectar scroll para mostrar el botón para subir arriba
  useEffect(() => {
    
   const scrollableElement = document.getElementById('main-content');
    
    
    if (!scrollableElement) return;

   const handleScroll = () => {
      
   const scrollY = scrollableElement.scrollTop;
   setShowScrollTop(scrollY > 50);
   };

    
   scrollableElement.addEventListener("scroll", handleScroll);
   
   // Comprobación inicial
   handleScroll();

   // Limpia el listener del contenedor
   return () => {
   scrollableElement.removeEventListener("scroll", handleScroll);
   };
   }, []);
   
   // Función para volver arriba
   const scrollToTop = () => {
    
    const scrollableElement = document.getElementById('main-content');
    if (scrollableElement) {
        scrollableElement.scrollTo({ 
    top: 0, 
   behavior: "smooth" 
   });
    }
   };


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
    // Subir al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <>
    <div className="container mx-auto px-4 py-6 space-y-6 mt-[80px]">
      <Title
        title="Distribucciones Ferrelectricos Restrepo"
        subtitle="Todos los productos"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Columna izquierda - Filtros fijos */}
          <div className="md:col-span-1">
            <div className="sticky top-[100px]">
              <CategoryFilterSidebar />
            </div>
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

    {/* Botón flotante para volver arriba */}
          {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-[#F4C048] hover:bg-[#f1b212] text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 opacity-90 hover:opacity-100 z-[9999]"
          aria-label="Volver al inicio"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
};

export default HomePage;