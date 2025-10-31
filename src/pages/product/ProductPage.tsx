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

  return (
    <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-3 mt-[110px]">
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
        <StockLabel stock={product.stock} />

        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.referencia}
        </h1>

        <h1 className={`${titleFont.className} antialiased font-bold text-xl mb-5`}>
          {product.detalle}
        </h1>

        {/* Precio */}
          {isAdminOrSales ? (
            <div className="mb-5 space-y-1">
              <h3 className="font-bold text-gray-800 mb-2">Lista de precios:</h3>
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

        <AddToCart product={product} />
        {/* Master package */}
        <div className="mt-4">
          <h3 className="font-bold text-sm">Master</h3>
          <p className="font-light">
            {masterPackage ? masterPackage.mount : "N/A"} unidades
          </p>
        </div>
        {/*Referencia */}
        <h3 className="font-bold text-sm mt-4">Referencia</h3>
        <p className="font-light">{product.referencia}</p>
        {/* Descripción */}
        <h3 className="font-bold text-sm mt-4">Descripción</h3>
        <p className="font-light">{product.detalle}</p>
      </div>
    </div>
  );
};
