//src/pages/checkout/ui/ProductsIncart.tsx

import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useCartStore } from '@/store';
import { currencyFormat } from '@/utils';
import { CartProduct } from "@/interfaces";
import { ProductImage, QuantitySelector } from "@/components";

export const ProductsInCart = () => {

  const updateProductQuantity = useCartStore((state) => state.updateProductQuantity);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const getCartWithOffers = useCartStore((state) => state.getCartWithOffers);
  const [loaded, setLoaded] = useState(false);
  const productsInCart = useCartStore((state) => state.cart);


  useEffect(() => {
    setLoaded(true);
  }, []);

  if( !loaded ) {
    return <p>Loading...</p>
  }

  // Función para obtener el precio correcto del producto
  const getProductPrice = (product: CartProduct): number => {
    if (product.precios && product.precios.length > 0) {
      // Usar valorpos primero, luego valor, y finalmente 0 si no hay precios
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };
  // Obtener información del carrito con ofertas para mostrar precios actualizados
  const cartWithOffers = getCartWithOffers();

  return (
    <>
      {productsInCart.map((product) => {

        const imageUrl = product.image?.url?.trim();
        const fallbackImage = "/products/placeholder.jpg";


        // Calcular precio unitario con posibles descuentos aplicados
        const unitPrice = getProductPrice(product);
        //const totalPrice = unitPrice * product.quantity;
        
        // Verificar si este producto tiene descuento aplicado
        const hasDiscount = cartWithOffers.discount > 0;
        
        // Si quieres mostrar el precio con descuento por producto individualmente,
        // necesitarías calcularlo aquí
        const productInOffer = cartWithOffers.cart.find(p => p._id === product._id);
        const productDiscount = productInOffer && hasDiscount ? 
          (unitPrice * product.quantity) * (cartWithOffers.discount / cartWithOffers.total) : 0;

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
              <Link
                className="hover:underline cursor-pointer"
                to={`/product/${product._id} `}
              >
                {product.detalle}
              </Link>

              <p>${unitPrice.toLocaleString()}</p>
              
              {productDiscount > 0 && (
                <p className="text-red-600 text-sm">Descuento: -${productDiscount.toLocaleString()}</p>
              )}

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
        );
      })}
    </>
  );
};