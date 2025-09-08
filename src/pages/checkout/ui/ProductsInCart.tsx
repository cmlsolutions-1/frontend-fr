//src/pages/checkout/ui/ProductsIncart.tsx

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store';
import { currencyFormat } from '@/utils';
import { CartProduct } from "@/interfaces";
import { ProductImage, QuantitySelector } from "@/components";

export const ProductsInCart = () => {

  const [loaded, setLoaded] = useState(false);
  const productsInCart = useCartStore( state => state.cart );


  useEffect(() => {
    setLoaded(true);
  }, []);

  if( !loaded ) {
    return <p>Loading...</p>
  }

  // ✅ Función para obtener el precio correcto del producto
  const getProductPrice = (product: CartProduct): number => {
    if (product.precios && product.precios.length > 0) {
      // Usar valorpos primero, luego valor, y finalmente 0 si no hay precios
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  return (
    <>
      {productsInCart.map((product) => {

        const imageUrl = product.image?.url?.trim();
        const fallbackImage = "/products/placeholder.jpg";
        return (

        <div key={product._id} className="flex mb-5">
          <ProductImage
                        src={imageUrl || fallbackImage}
                        width={100}
                        height={100}
                        alt={product.detalle}
                        className="mr-5 rounded"
                      />

          <div>
            <span>
              {product.detalle} ({product.quantity})
            </span>
            
            <p className="font-bold">
              {currencyFormat(getProductPrice(product) * product.quantity)}
            </p>
          </div>
        </div>
      );
    })}
    </>
  );
};