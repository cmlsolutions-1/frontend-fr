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
    <div className="rounded-md overflow-hidden fade-in bg-white shadow-md h-full flex flex-col">
      <Link to={`/product/${product.slug}`}>
        <img
          src={`/products/${displayImage}`}
          alt={product.title}
          className="w-full h-full object-cover"
          onMouseEnter={() =>
            setDisplayImage(product.ProductImage?.[1]?.url || displayImage)
          }
          onMouseLeave={() =>
            setDisplayImage(product.ProductImage?.[0]?.url || displayImage)
          }
        />
      </Link>

      <div className="p-4 flex flex-col justify-between flex-1 w-full">
        <Link
          className="hhover:text-blue-600 text-sm font-medium h-[1.75rem] overflow-hidden text-ellipsis whitespace-nowrap"
          to={`/product/${product.slug}`}
        >
          {cleanTitle(product.title)}
        </Link>
        <span className="font-bold">${product.price}</span>
        <span>
          <span className="font-bold">Master:</span> {product.master}
        </span>
        {/* agregar aca el contador para poner la cantidad */}
        <div className="mt-auto w-full">
          <Agregar product={product} />
        </div>
      </div>
    </div>
  );
};
