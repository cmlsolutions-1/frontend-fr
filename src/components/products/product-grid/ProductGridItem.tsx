//src/components/products/product-grid/ProductGridItem.tsx

import { Product } from "@/interfaces";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Agregar } from "./Agregar";

interface Props {
  product: Product;
}

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(
    product.ProductImage?.[0]?.url || "/products/no-image.jpg"
  );

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

  return (
    <div className="rounded-md overflow-hidden bg-white shadow-md h-full flex flex-col transition-all duration-200 hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block w-full aspect-[4/3]">
        <img
          src={`/products/${displayImage}`}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onMouseEnter={() =>
            setDisplayImage(product.ProductImage?.[1]?.url || displayImage)
          }
          onMouseLeave={() =>
            setDisplayImage(product.ProductImage?.[0]?.url || displayImage)
          }
        />
      </Link>
{/* Contenido */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <Link
          className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate"
          to={`/product/${product.slug}`}
        >
          {cleanTitle(product.title)}
        </Link>
        <span className="mt-1 text-base font-bold text-gray-900">${product.price}</span>
        <span className="text-sm text-gray-600">
          <span className="font-bold">Master:</span> {product.master}
        </span>
        {/* Agregar al carrito */}
        <div className="mt-auto pt-4">
          <Agregar product={product} />
        </div>
      </div>
    </div>
  );
};
