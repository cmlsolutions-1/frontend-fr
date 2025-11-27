// src/pages/product/ProductPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getClientProductPrice } from "@/utils/getClientProductPrice";
import { getPriceCategories, PriceCategory } from '@/services/priceCategories.service';
import { useAuthStore } from '@/store/auth-store';

import { titleFont } from '@/config/fonts';
import {
  ProductMobileSlideshow,
  ProductSlideshow,
  StockLabel
} from '@/components';
import { AddToCart } from './ui/AddToCart';
import { Product } from '@/interfaces';
import { getProductById } from '@/services/products.service';

export const ProductPage = () => {
  const { _id  } = useParams<{ _id : string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();


  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const placeholder = "/img/placeholder.jpg"; // imagen por defecto
  const isAdminOrSales = user?.role === "Admin" || user?.role === "SalesPerson";

  const getMasterValue = (product: Product) => {
    const masterPackage = product.packages?.find(
      (p) => p.typePackage === "Master"
    );
    return masterPackage ? masterPackage.Mount : "N/A";
  };
  
  const masterValue = product ? getMasterValue(product) : "N/A";

  useEffect(() => {
    const fetchProduct = async () => {
      if (!_id) {
        setError("ID de producto no válido");
        setLoading(false);
        return;
      }

      try {

      const fetchedProduct = await getProductById(_id);

      // Validación adicional del producto recibido
        if (!fetchedProduct || !fetchedProduct._id) {
          throw new Error("Producto inválido recibido del servidor");
        }

      setProduct(fetchedProduct);
      setError(null);

    } catch (error) {

      const errorMessage = error instanceof Error 
          ? error.message 
          : "Error desconocido al cargar el producto";
        setError(errorMessage);
      // navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [_id, navigate]);

  if (loading) return <p className="p-4">Cargando...</p>;
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Volver atrás
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <p className="p-4">Producto no encontrado</p>;

  // Determinar si el producto está agotado
  const isOutOfStock = product.stock <= 0;


  // Obtener la URL de la imagen
  const imageUrl = product.image?.url?.trim() || placeholder;

  // Función para obtener el precio correcto del cliente
  const getClientProductPrice = (): number | null => {
    if (!product.precios || product.precios.length === 0) return null;

    // Si no hay usuario autenticado, usar el primer precio disponible
    if (!user || !user.priceCategory) {
      return product.precios[0]?.valorpos || product.precios[0]?.valor || null;
    }

    // Buscar el precio que corresponde a la categoría del cliente
    const precioCliente = product.precios.find(p => p.precio === user.priceCategory);
    
    // Si no se encuentra el precio específico, usar el primero disponible
    if (!precioCliente) {
      return product.precios[0]?.valorpos || product.precios[0]?.valor || null;
    }

    // Retornar el precio específico del cliente (priorizar valorpos)
    return precioCliente.valorpos || precioCliente.valor || null;
  };

  // Función para formatear el precio
  const formatPrice = (): string => {
    const price = getClientProductPrice();
    if (price === null) return "Sin precio";
    return `$${price.toLocaleString()}`;
  };

  // Package Master
  const masterPackage = product.packages?.find((p) => p.typePackage === "Master");

  // Función para determinar la fuente de navegación
  const getBreadcrumbNavigation = () => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('categories')) {
      const categoryId = searchParams.get('categories');
      return {
        type: 'category',
        id: categoryId,
        name: product.subCategory?.name || "Categoría"
      };
    } else if (searchParams.has('brands')) {
      const brandCode = searchParams.get('brands');
      return {
        type: 'brand',
        id: brandCode,
        name: product.brand.name
      };
    }
    return null;
  };

  const breadcrumbSource = getBreadcrumbNavigation();

  return (
    <div className="mt-[130px]">

      {/* --- BREADCRUMB --- */}
      <div className="container mx-auto px-4 mb-6 flex flex-wrap items-center gap-2 
      text-sm text-gray-600 overflow-hidden ">

        {/* Inicio */}
        <button
      onClick={() => navigate('/homePage')}
      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
    >
      Inicio
    </button>

        {/* Separador con icono */}
        <span className="text-gray-400 mx-1">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </span>

        {/* Categoría */}
        {product.subCategory?.name && (
      <>
        <button
          onClick={() =>
            product.subCategory?._id &&
            navigate(`/homePage?categories=${product.subCategory._id}&page=1`)
          }
          className="hover:text-blue-700 text-blue-600 
          truncate max-w-[80px] md:max-w-none overflow-hidden"
        >
          {product.subCategory.name}
        </button>

            {/* Separador con icono */}
            <span className="text-gray-400 mx-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
          </>
        )}

        {/* Marca */}
        {product.brand?.name && (
      <>
        <button
          onClick={() =>
            navigate(`/homePage?brands=${product.brand.code || product.brand.name}&page=1`)
          }
          className="hover:text-blue-700 text-blue-600 
          truncate max-w-[80px] md:max-w-none overflow-hidden"
        >
          {product.brand.name}
        </button>

            {/* Separador con icono */}
            <span className="text-gray-400 mx-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
          </>
        )}

        {/* Nombre del producto */}
        <span className="font-semibold text-gray-800 truncate max-w-[90px] md:max-w-md
      overflow-hidden">
      {product.detalle}
    </span>
      </div>


      {/* ---- CONTENIDO PRINCIPAL ------ */}

    <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-3 mt-[40px]">


      
      {/* Slideshow */}
      <div className="col-span-1 md:col-span-2">
        <ProductMobileSlideshow
          title={product.detalle}
          images={[imageUrl]}
          className="block md:hidden"
        />
        <ProductSlideshow
          title={product.detalle}
          images={[imageUrl]}
          className="hidden md:block"
        />
      </div>

      {/* Detalles */}
      <div className="col-span-1 px-5">
        
        <h1 className={`${titleFont.className} antialiased font-bold text-xl mb-5`}>
          {product.detalle}
        </h1>

        {/* Precio */}
          {isAdminOrSales ? (
            <div className="mb-5 space-y-1">
              <h3 className="font-bold text-gray-800 mb-2">Lista de Precios:</h3>
              {product.precios?.map((p) => {
                // Diccionario de etiquetas 
                const priceLabels: Record<string, string> = {
                  FER: "Ferretería",
                  "001": "VIP SAS",
                };

                const label = priceLabels[p.precio] || p.precio;

                return (
                  <div key={p.precio} className="text-lg text-gray-900">
                  <span className="font-bold">{label}</span>: ${ (p.valorpos ?? p.valor ?? 0).toLocaleString() }
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-lg mb-5 font-bold text-gray-900">{formatPrice()}</p>
          )}

        {isOutOfStock ? (
            <span className="inline-block w-full text-center py-2 bg-red-500 text-white font-bold rounded-md">
              Producto Agotado
            </span>
          ) : (
            <AddToCart product={product} />
          )}
        {/* Master package */}
        <div className="mt-4">
          <h3 className="font-bold text-sm">Master</h3>
          <p className="font-light">
            {masterValue} unidades
          </p>
        </div>
        {/*Referencia */}
        <h3 className="font-bold text-sm mt-4">Referencia</h3>
        <p className="font-light">{product.referencia}</p>

        {/*Stock */}
        <h3 className="font-bold text-sm mt-4">Stock</h3>
        <p className="font-light">{product.stock} unidades </p>
        {/* <StockLabel stock={product.stock} /> */}

        {/*Categoria */}
        <h3 className="font-bold text-sm mt-4">Categoría</h3>
        <p className="font-light">{product.subCategory && product.subCategory.name // Valida antes de acceder
              ? product.subCategory.name
              : "Sin categoría"}  </p>

        {/*Marca */}
        <h3 className="font-bold text-sm mt-4">Marca</h3>
        <p className="font-light">{product.brand.name} </p>
        
      </div>
      </div>
    </div>
  );
};
