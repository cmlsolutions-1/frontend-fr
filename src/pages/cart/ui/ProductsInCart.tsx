//src/pages/cart//ui/ProductsInCart.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import { useCartStore } from "@/store";
import { ProductImage, QuantitySelector } from "@/components";
import { CartProduct } from "@/interfaces";

export const ProductsInCart = () => {
  const updateProductQuantity = useCartStore((state) => state.updateProductQuantity);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const [loaded, setLoaded] = useState(false);
  const productsInCart = useCartStore((state) => state.cart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p>Loading...</p>;
  }

  // ✅ Función para obtener el precio correcto del cliente
  const getProductPrice = (product: CartProduct): number => {
    // Por ahora usamos el primer precio disponible, luego puedes integrar el sistema de precios por cliente
    if (product.precios && product.precios.length > 0) {
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  return (
    <>
      {productsInCart.map((product) => (
        <div key={`${product._id}`} className="flex mb-5">
          <ProductImage
            src={product.image ? `/products/${product.image}` : "/products/placeholder.jpg"}
            width={100}
            height={100}
            style={{
              width: "100px",
              height: "100px",
            }}
            alt={product.detalle}
            className="mr-5 rounded"
          />

          <div>
            <Link
              className="hover:underline cursor-pointer"
              to={`/product/${product._id} `}
            >
              {/* { product.size } - {product.title} */}
              {product.detalle}
            </Link>

            <p>${getProductPrice(product).toLocaleString()}</p>
            <QuantitySelector
              quantity={product.quantity}
              onQuantityChanged={(quantity) =>
                updateProductQuantity(product, quantity)
              }
            />

            <button
              onClick={() => removeProduct(product)}
              className="underline mt-3 font-medium text-indigo-600 hover:text-indigo-500"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </>
  );
};
