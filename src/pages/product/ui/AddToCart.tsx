//src/pages/product/ui/AddToCart

import { useState } from "react";
import { QuantitySelector} from "@/components";
//import { QuantitySelector, SizeSelector } from "@/components";
import type { CartProduct, Product } from "@/interfaces";
import { useCartStore } from '@/store';
import { useAuthStore } from "@/store/auth-store";


interface Props {
  product: Product;
}

export const AddToCart = ({ product }: Props) => {
  const { user } = useAuthStore();

  const addProductToCart = useCartStore( state => state.addProductTocart );

  //const [size, setSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const [posted, setPosted] = useState(false);

  const addToCart = () => {
    setPosted(true);

    //if (!size) return;

    const cartProduct: CartProduct = {
      ...product,      // toma todo lo de Product
      quantity: quantity, // y agregamos la cantidad
    };

    addProductToCart(cartProduct);
    setPosted(false);
    setQuantity(1);
    //setSize(undefined);


  };

  //No mostrar el botón si el rol no es "Client"
  if (user?.role !== "Client") {
    return null;
  }


  return (
    <>
      {posted && (
        <span className="mt-2 text-red-500 fade-in">
          Debe de seleccionar una talla*
        </span>
      )}

      {/* Selector de Cantidad */}
      <QuantitySelector quantity={quantity} onQuantityChanged={setQuantity} />

      {/* Button */}
      <button onClick={addToCart} className="btn-primary my-5 flex items-center justify-center rounded-md border border-transparent 
                bg-[#F2B318] px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-[#F4C048]">
        Agregar al carrito
      </button>
    </>
  );
};
