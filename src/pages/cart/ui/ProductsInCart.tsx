//src/pages/cart//ui/ProductsInCart.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import { useCartStore } from "@/store";
import { ProductImage, QuantitySelector } from "@/components";
import { CartProduct } from "@/interfaces";

interface Props {
  readOnly?: boolean; // para modo checkout
}

export const ProductsInCart: React.FC<Props> = ({ readOnly = false }) => {
  const updateProductQuantity = useCartStore((state) => state.updateProductQuantity);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const [loaded, setLoaded] = useState(false);
  const getCartWithOffers = useCartStore((state) => state.getCartWithOffers);
  const productsInCart = useCartStore((state) => state.cart);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <p>Loading...</p>;
  }
  

  // Función para obtener el precio correcto del cliente
  const getProductPrice = (product: CartProduct): number => {
    // Por ahora usamos el primer precio disponible, luego puedes integrar el sistema de precios por cliente
    if (product.precios && product.precios.length > 0) {
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  // Obtener información del carrito con ofertas
  const cartWithOffers = getCartWithOffers();

  

  return (
    <>
      {productsInCart.map((product) => {
        //Extraer la URL de la imagen
        const imageUrl = product.image?.url?.trim();
        const fallbackImage = "/products/placeholder.jpg";

        // Calcular precio unitario
        const unitPrice = getProductPrice(product);
        const totalPrice = unitPrice * product.quantity;
        
        // Calcular descuento aplicado a este producto (si aplica)
        let productDiscount = 0;
        if (cartWithOffers.discount > 0) {
          // Solo calcular descuento si el producto tiene una oferta aplicable
          const promotions = useCartStore.getState().promotions;
          const currentDate = new Date();
          
          for (const promotion of promotions) {
            const isActive = promotion.state === "Active" && 
                            new Date(promotion.endDate) >= currentDate;
            
            if (!isActive) continue;
            
            if (promotion.isAll) {
              // Si es para todos los productos, aplicar proporcionalmente
              const totalValue = cartWithOffers.cart.reduce((sum, item) => {
                const price = getProductPrice(item);
                return sum + (price * item.quantity);
              }, 0);
              
              if (totalValue > 0) {
                const productValue = unitPrice * product.quantity;
                productDiscount = (productValue / totalValue) * cartWithOffers.discount;
              }
            } else {
              // Oferta para productos específicos
              const promotionProductIds = promotion.products.map((p: any) => p._id);
              
              if (promotionProductIds.includes(product._id)) {
                if (promotion.typePackage === "inner" || promotion.typePackage === "unidad") {
                  if (product.quantity >= promotion.minimumQuantity) {
                    const price = getProductPrice(product);
                    const itemTotal = price * product.quantity;
                    const itemSubTotal = itemTotal / 1.19; // Antes de IVA
                    productDiscount = itemSubTotal * (promotion.percentage / 100);
                  }
                } else if (promotion.typePackage === "master") {
                  const price = getProductPrice(product);
                  const itemTotal = price * product.quantity;
                  const itemSubTotal = itemTotal / 1.19; // Antes de IVA
                  productDiscount = itemSubTotal * (promotion.percentage / 100);
                }
              }
            }
          }
        }

        return (
          <div key={`${product._id}`} className="flex mb-5">
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
              {/* { product.size } - {product.title} */}
              
              {product.detalle}
            </Link>

            {/* <p>${getProductPrice(product).toLocaleString()}</p> */}
            <p>${unitPrice.toLocaleString()} </p>
            <p>Ref: {product.referencia}</p>
              
              {productDiscount > 0 && (
                <p className="text-red-600 text-sm">Descuento: -${productDiscount.toFixed(2).toLocaleString()}</p>
              )}


            <QuantitySelector
                quantity={product.quantity}
                onQuantityChanged={(quantity) =>
                  !readOnly && updateProductQuantity(product, quantity)
                }
                readOnly={readOnly}
              />

              {!readOnly && (
                <button
                  onClick={() => removeProduct(product)}
                  className="underline mt-3 font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Remover
                </button>
              )}
          </div>
        </div>
      );
    })}
    </>
  );
};
