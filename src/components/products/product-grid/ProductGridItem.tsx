//src/components/products/product-grid/ProductGridItem.tsx

import { Product } from "@/interfaces";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Agregar } from "./Agregar";
import { useAuthStore } from "@/store/auth-store";

interface Props {
  product: Product;
}

export const ProductGridItem = ({ product }: Props) => {
  const { user } = useAuthStore();
  const isClient = user?.role === "Client";
  const isAdminOrSales = user?.role === "Admin" || user?.role === "SalesPerson";

  const masterPackage = product.packages?.find(
    (p) => p.typePackage === "Master"
  );
  // Asegúrate de que image y image.url existan
  const imageUrl = product.image?.url?.trim();
  const fallbackImage = "/images/no-image.jpg";

  const [displayImage, setDisplayImage] = useState(imageUrl || fallbackImage);
  const handleMouseEnter = () => {
    // poner imagen alternativa
  };

  const handleMouseLeave = () => {
    setDisplayImage(imageUrl || fallbackImage);
  };

  //Función para obtener el precio correcto según la categoría del cliente
  const getClientProductPrice = (product: Product): number => {
    if (!product.precios || product.precios.length === 0) return 0;
    //console.log("👉 Precio mostrado:", productPrice);

    // Si no hay usuario autenticado, mostrar el primer precio disponible
    if (!user || !user.priceCategory) {
      return product.precios[0]?.valorpos || product.precios[0]?.valor || 0;
    }

    // Buscar la categoría de precio del cliente
    const clientPriceCategory = user.priceCategory;


    const referenceProduct = product.referencia;

    // Buscar el precio que corresponde a la categoría del cliente
    const precioCliente = product.precios.find(
      (p) => p.precio === clientPriceCategory
    );

    // Si no se encuentra el precio específico, usar el primero disponible
    if (!precioCliente) {
      return product.precios[0]?.valorpos || product.precios[0]?.valor || 0;
    }

    // Retornar el precio específico del cliente (priorizar valorpos)
    return precioCliente.valorpos || precioCliente.valor || 0;
  };

  const capitalizeWords = (text: string) => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const cleanTitle = (text: string) => {
    return capitalizeWords(
      text
        .replace(/[\n\r\u2028\u2029\u200B]+/g, " ") // limpia saltos de línea, espacios invisibles
        .replace(/\s+/g, " ") // colapsa múltiples espacios
        .trim()
    );
  };

  // Obtener el precio correcto
  const productPrice = getClientProductPrice(product);
  console.log("👉 precios recibidos:", product.precios);

  return (
    <div className="rounded-md overflow-hidden bg-white shadow-md h-full flex flex-col transition-all duration-200 hover:shadow-lg">
      {/* Imagen */}
      <Link
        to={`/product/${product._id}`}
        className="block w-full aspect-[4/3]"
      >
        <img
          src={displayImage}
          alt={product.detalle}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onError={(e) => {
            if (displayImage !== fallbackImage) {
              setDisplayImage(fallbackImage);
            }
          }}
        />
      </Link>
      {/* Contenido */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <Link
          className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate"
          to={`/product/${product._id}`}
        >
          {cleanTitle(product.detalle)}
        </Link>

        {/* Vista diferente según el rol */}
        {isClient && (
        <span className="mt-1 text-base font-bold text-gray-900">
          {productPrice > 0
            ? `$${productPrice.toLocaleString()}`
            : "Sin precio"}
        </span>
        )}

        {isAdminOrSales && (
        <div className="mt-1 text-sm text-gray-700 space-y-1">
          {product.precios?.map((p) => (
            <div key={p.precio} className="flex justify-between">
              <span className="font-semibold">{p.precio}:</span>
              <span>${(p.valorpos ?? p.valor ?? 0).toLocaleString()}</span>
              
            </div>
          ))}
        </div>
      )}

        <span className="text-sm text-gray-600">
          <span className="font-bold">Ref:</span>{" "}
          {product.referencia ? product.referencia : "N/A"}
        </span>

        <span className="text-sm text-gray-600">
          <span className="font-bold">Master:</span>{" "}
          {masterPackage ? masterPackage.mount : "N/A"}
        </span>

        {/* Agregar al carrito mostrar solo para clientes */}
        {isClient && (
        <div className="mt-auto pt-4">
          <Agregar product={product} />
        </div>
        )}
      </div>
    </div>
  );
};
