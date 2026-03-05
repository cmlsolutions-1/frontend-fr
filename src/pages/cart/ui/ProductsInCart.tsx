import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import { useCartStore } from "@/store";
import { ProductImage, QuantitySelector } from "@/components";
import { CartProduct } from "@/interfaces";
import { Trash2 } from "lucide-react";

interface Props {
  readOnly?: boolean; // para modo checkout
}

export const ProductsInCart: React.FC<Props> = ({ readOnly = false }) => {
  const updateProductQuantity = useCartStore((state) => state.updateProductQuantity);
  const removeProduct = useCartStore((state) => state.removeProduct);
  const [loaded, setLoaded] = useState(false);

  const getCartWithOffers = useCartStore((state) => state.getCartWithOffers);
  const productsInCart = useCartStore((state) => state.cart);

  // errores por producto (stock, etc.)
  const [qtyErrors, setQtyErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLoaded(true);
  }, []);

  // Limpia errores de productos que ya no están en el carrito
  useEffect(() => {
    const ids = new Set(productsInCart.map((p) => p._id));
    setQtyErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((id) => {
        if (!ids.has(id)) delete next[id];
      });
      return next;
    });
  }, [productsInCart]);

  if (!loaded) return <p>Loading...</p>;

  // precio (tu lógica actual)
  const getProductPrice = (product: CartProduct): number => {
    if (product.precios && product.precios.length > 0) {
      return product.precios[0].valorpos || product.precios[0].valor || 0;
    }
    return 0;
  };

  // stock disponible (ajusta si tu campo real es otro)
  const getAvailableStock = (product: any): number => {
    const s = product?.platformStock ?? product?.stock ?? product?.idProduct?.platformStock ?? product?.idProduct?.stock;
    return typeof s === "number" ? s : 0;
  };

  const cartWithOffers = getCartWithOffers();

  return (
    <>
      {productsInCart.map((product) => {
        const imageUrl = product.image?.url?.trim();
        const fallbackImage = "/products/placeholder.jpg";

        const unitPrice = getProductPrice(product);

        const availableStock = getAvailableStock(product);

        // handler con validación
        const handleQtyChange = (nextQty: number) => {
          if (readOnly) return;

          // si no tienes stock (0) y quieres permitir igual, comenta esto.
          // Aquí 0 lo tratamos como "sin stock" (bloquea)
          if (availableStock > 0 && nextQty > availableStock) {
            setQtyErrors((prev) => ({
              ...prev,
              [product._id]: `Stock insuficiente: solo hay ${availableStock} unidades. Por favor corrige la cantidad.`,
            }));
            return; // NO actualiza el store
          }

          // OK -> limpia error y actualiza
          setQtyErrors((prev) => {
            const next = { ...prev };
            delete next[product._id];
            return next;
          });

          updateProductQuantity(product, nextQty);
        };

        return (
          <div key={`${product._id}`} className="flex mb-5">
            <ProductImage
              src={imageUrl || fallbackImage}
              width={100}
              height={100}
              alt={product.detalle}
              className="mr-5 rounded"
            />

            <div className="flex-1">
              <Link className="hover:underline cursor-pointer" to={`/product/${product._id} `}>
                {product.detalle}
              </Link>

              <p>${unitPrice.toLocaleString()}</p>
              <p>Ref: {product.referencia}</p>

              {/* tu descuento (sin cambios) */}
              {(() => {
                let productDiscount = 0;

                if (cartWithOffers.discount > 0) {
                  const promotions = useCartStore.getState().promotions;
                  const currentDate = new Date();

                  for (const promotion of promotions) {
                    const isActive =
                      promotion.state === "Active" && new Date(promotion.endDate) >= currentDate;
                    if (!isActive) continue;

                    if (promotion.isAll) {
                      const totalValue = cartWithOffers.cart.reduce((sum, item) => {
                        const price = getProductPrice(item as any);
                        return sum + price * (item as any).quantity;
                      }, 0);

                      if (totalValue > 0) {
                        const productValue = unitPrice * product.quantity;
                        productDiscount = (productValue / totalValue) * cartWithOffers.discount;
                      }
                    } else {
                      const promotionProductIds = promotion.products.map((p: any) => p._id);
                      if (promotionProductIds.includes(product._id)) {
                        if (promotion.typePackage === "inner" || promotion.typePackage === "unidad") {
                          if (product.quantity >= promotion.minimumQuantity) {
                            const itemTotal = unitPrice * product.quantity;
                            const itemSubTotal = itemTotal / 1.19;
                            productDiscount = itemSubTotal * (promotion.percentage / 100);
                          }
                        } else if (promotion.typePackage === "master") {
                          const itemTotal = unitPrice * product.quantity;
                          const itemSubTotal = itemTotal / 1.19;
                          productDiscount = itemSubTotal * (promotion.percentage / 100);
                        }
                      }
                    }
                  }
                }

                return productDiscount > 0 ? (
                  <p className="text-red-600 text-sm">
                    Descuento: -${productDiscount.toFixed(2).toLocaleString()}
                  </p>
                ) : null;
              })()}

              <QuantitySelector
                quantity={product.quantity}
                onQuantityChanged={handleQtyChange}
                readOnly={readOnly}
              />

              {/* Mensaje stock */}
              {!readOnly && qtyErrors[product._id] && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {qtyErrors[product._id]}
                </p>
              )}

              {!readOnly && (
                <button
                  onClick={() => removeProduct(product)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};