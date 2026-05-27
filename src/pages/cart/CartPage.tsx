import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useMemo } from "react";

import { Title } from "@/components";
import { ProductsInCart } from "./ui/ProductsInCart";
import { OrderSummary } from "./ui/OrderSummary";
import { useCartStore } from "@/store/cart/cart-store";

export const CartPage = () => {
  const { cart, setPromotions } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { getActivePromotions } = await import("@/services/promotions.service");
        const activePromotions = await getActivePromotions();
        setPromotions(activePromotions);
      } catch (error) {
        setPromotions([]);
      }
    };

    fetchPromotions();
  }, [setPromotions]);

  if (cart.length === 0) {
    navigate("/empty");
    return null;
  }

  const getAvailableStock = (product: any): number => {
    const s =
      product?.platformStock ??
      product?.stock ??
      product?.idProduct?.platformStock ??
      product?.idProduct?.stock;

    return typeof s === "number" ? s : 0;
  };

  const hasStockErrors = useMemo(() => {
    return cart.some((product) => {
      const availableStock = getAvailableStock(product);
      return availableStock > 0 && product.quantity > availableStock;
    });
  }, [cart]);

  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title="Carrito" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col mt-5">
            <span className="text-xl">Agregar más items</span>
            <Link
              to="/homePage"
              className="underline mb-5 font-medium text-indigo-600 hover:text-indigo-500"
            >
              Continúa comprando
            </Link>

            <ProductsInCart />
          </div>

          <div className="bg-white rounded-xl shadow-xl p-7 h-fit ">
            <h2 className="mb-2 mt-5 text-2xl font-medium text-gray-900">
              Resumen de orden
            </h2>

            <OrderSummary />

            {hasStockErrors && (
              <p className="mt-4 text-sm font-medium text-red-600">
                Debes corregir las cantidades de los productos con stock insuficiente
                antes de continuar al checkout.
              </p>
            )}

            <div className="mt-5 mb-2 w-full">
              {hasStockErrors ? (
                <button
                  disabled
                  className="flex w-full cursor-not-allowed items-center justify-center rounded-md border border-transparent bg-gray-400 px-6 py-3 text-base font-medium text-white shadow-xs opacity-70"
                >
                  Checkout
                </button>
              ) : (
                <Link
                  className="flex items-center justify-center rounded-md border border-transparent bg-[#F2B318] px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-[#F4C048]"
                  to="/checkout"
                >
                  Checkout
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};