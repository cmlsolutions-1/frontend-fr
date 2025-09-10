import { useState } from "react";
import type { CartProduct, Product } from "@/interfaces";
import { useCartStore } from "@/store";

interface Props {
  product: Product;
}

export const Agregar = ({ product }: Props) => {
  const addProductToCart = useCartStore((state) => state.addProductTocart);

  //const [size, setSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const [posted, setPosted] = useState(false);

  const agregar = () => {
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

  return (
    <>
      {/* Button */}
      <button
        onClick={agregar}
        className="w-full flex items-center justify-center rounded-md 
        bg-[#F2B318] px-6 py-2 text-base font-medium text-white 
        shadow-sm transition-colors duration-200 hover:bg-[#F4C048]"
      >
        Añadir
      </button>
    </>
  );
};
