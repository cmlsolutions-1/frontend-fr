import { Product } from "@/interfaces";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Agregar } from "./Agregar";

interface Props {
  product: Product;
}

export const ProductGridItem = ({ product }: Props) => {
  const [displayImage, setDisplayImage] = useState(product.images[0]);

  return (
    <div className="rounded-md overflow-hidden fade-in bg-white shadow-md h-full flex flex-col">
      <Link to={`/product/${product.slug}`}>
        <img
          src={`/products/${displayImage}`}
          alt={product.title}
          className="w-full h-full object-cover"
          onMouseEnter={() => setDisplayImage(product.images[1])}
          onMouseLeave={() => setDisplayImage(product.images[0])}
        />
      </Link>

      <div className="p-4 flex flex-col justify-between flex-1 w-full">
        <Link className="hover:text-blue-600" to={`/product/${product.slug}`}>
          {product.title.toLowerCase()}
        </Link>
        <span className="font-bold">${product.price}</span>
        {/* agregar aca el contador para poner la cantidad */}
        <div className="mt-auto w-full">
          <Agregar product={product} />
        </div>
      </div>
    </div>
  );
};
