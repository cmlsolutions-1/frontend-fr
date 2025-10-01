//src/pages/cart/CartPage.tsx

import { Link,useNavigate } from "react-router-dom";
import React ,{ useEffect } from "react";

import { Title } from "@/components";
import { ProductsInCart } from "./ui/ProductsInCart";
import { OrderSummary } from "./ui/OrderSummary";
import { useCartStore } from "@/store/cart/cart-store";


export const CartPage = () => {
  const { cart, setPromotions} = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar promociones activas
    const fetchPromotions = async () => {
      try {
        const { getActivePromotions } = await import("@/services/promotions.service");
        const activePromotions = await getActivePromotions();
        setPromotions(activePromotions);
      } catch (error) {
        console.error("Error al cargar promociones:", error);
        setPromotions([]);
      }
    };

    fetchPromotions();
  }, [setPromotions]);

  if (cart.length === 0) {
    navigate('/empty'); 
    return null; 
  }



  return (
    <div className="flex justify-center items-center mb-72 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title="Carrito" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Carrito */}
          <div className="flex flex-col mt-5">
            <span className="text-xl">Agregar más items</span>
            <Link to="/homePage" 
              className="underline mb-5 font-medium text-indigo-600 hover:text-indigo-500">
              Continúa comprando
            </Link>

            {/* Items */}
            <ProductsInCart />
          </div>

          {/* Checkout - Resumen de orden */}
          <div className="bg-white rounded-xl shadow-xl p-7 h-fit ">
            <h2 className="mb-2 mt-5 text-2xl font-medium text-gray-900">Resumen de orden</h2>

            <OrderSummary />

            <div className="mt-5 mb-2 w-full">
              <Link
                className="flex items-center justify-center rounded-md border border-transparent 
                bg-[#F2B318] px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-[#F4C048]"
                to="/checkout"
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
