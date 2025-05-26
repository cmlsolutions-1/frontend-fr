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
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity: quantity,
      //size: size,
      reference: product.reference,
      code: product.code,
      master: product.master,
      inner: product.inner,
      image: product.images[0],
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
        className="w-full bg-[#20B2AA] hover:bg-[#179b95] text-white font-semibold py-2 transition-colors"
      >
        Agregar a mi pedido
      </button>
    </>
  );
};
