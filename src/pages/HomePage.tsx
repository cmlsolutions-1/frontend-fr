//src/pages/HomePage.tsx

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Pagination, ProductGrid, Title } from "@/components";
import { CategoryFilterSidebar } from "@/components/filters/CategoryFilterSidebar";
import { filterProducts } from "@/services/products.service";
import { ArrowUp } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { CiFilter } from "react-icons/ci";
import React from 'react';
import { useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { AiOutlineDelete } from "react-icons/ai";



const HomePage = () => {


  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const PRODUCTS_PER_PAGE = 51;

  // Obtener parámetros de la URL
  const categories = searchParams.get('categories')?.split(',') || [];
  const brands = searchParams.get('brands')?.split(',') || [];
  const search = searchParams.get('search') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1');

  //boton flotante para subir al inicio
  const [showScrollTop, setShowScrollTop] = useState(false);


  //para mostrar y ocultar filtros
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get("search");


  
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

        if (isMounted) {
          // Verificar si es un error de autenticación
          if (err.isAuthError) { // <-- Verificar la propiedad isAuthError
            // --- Manejar error de autenticación ---
            logout(); // Limpiar estado de autenticación
            localStorage.removeItem("authToken"); // Limpiar token si es necesario
            localStorage.removeItem("user");      // Limpiar user si es necesario
             setError("auth_expired"); // Usar un código de error personalizado
          } else {
            // --- Manejar otros errores ---
            setError("Error al cargar los productos. Por favor, intenta más tarde.");
            setProducts([]);
          }
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
  }, [categories.join(','), brands.join(','), search, pageFromUrl, logout, navigate]); // Convertir arrays a strings para la dependencia

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
    setTimeout(() => {
      const scrollableElement = document.getElementById('main-content');
      if (scrollableElement) {
        scrollableElement.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        // En caso de que el contenedor no exista, hacer scroll global
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  if (loadingProducts && products.length === 0) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64 mt-[90px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // --- Mostrar mensaje personalizado para error de autenticación ---
    if (error === "auth_expired") { // <-- Verificar el código de error personalizado
      return (
        <div className="container mx-auto p-6 mt-[90px]">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <p className="text-yellow-700">
              Tu sesión ha expirado. Por favor,{" "}
              <button
                onClick={() => navigate('/login')} // Manejar clic para redirigir
                className="text-blue-600 hover:underline font-medium"
              >
                vuelve a iniciar sesión
              </button>
              .
            </p>
          </div>
        </div>
      );
    } else {
      // --- Mostrar mensaje genérico para otros errores ---
      return (
        <div className="container mx-auto p-6 mt-[90px]">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>{error}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <>
    <div className="container mx-auto px-4 py-6 space-y-6 mt-[80px]">
      <Title
        title="Distribucciones Ferrelectricos Restrepo"
        subtitle="Todos los productos"
      />
      {query && (
        <p className="text-gray-700 text-sm mb-3 flex items-center gap-2">
          Resultados para <span className="font-bold">"{query}"</span> — {products.length} coincidencias

          {/* Icono borrar al lado del texto */}
          <button
            onClick={() => {
              const params = new URLSearchParams(location.search);
              params.delete("search");
              navigate(`?${params.toString()}`, { replace: true });
            }}
            className="text-gray-500 hover:text-red-600 transition"
          >
            <AiOutlineDelete size={18} />
          </button>
        </p>
      )}




      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Columna izquierda - Filtros fijos */}
          <div className="hidden md:block md:col-span-1">
            <div className="sticky top-[100px]">
              <CategoryFilterSidebar />
            </div>
          </div>

          {/* Botón Filtros - Solo visible en móvil */}
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F4C048] text-white rounded-md shadow hover:bg-[#f1b212] transition-colors"
            >
              <CiFilter size={20} />
              <span>Filtros</span>
            </button>
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

        {/* Panel de filtros en móviles */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-3/4 sm:w-2/3 h-full p-4 overflow-y-auto shadow-lg animate-slideInRight relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-600 hover:text-black text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <CategoryFilterSidebar />
          </div>
        </div>
      )}

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