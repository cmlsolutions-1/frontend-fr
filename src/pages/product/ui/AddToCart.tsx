//src/pages/product/ui/AddToCart

import { useState } from "react";
import { QuantitySelector} from "@/components";
//import { QuantitySelector, SizeSelector } from "@/components";
import type { CartProduct, Product } from "@/interfaces";
import { useCartStore } from '@/store';

interface Props {
  product: Product;
}

export const AddToCart = ({ product }: Props) => {

  const addProductToCart = useCartStore( state => state.addProductTocart );

  //const [size, setSize] = useState<Size | undefined>();
  const [quantity, setQuantity] = useState<number>(1);
  const [posted, setPosted] = useState(false);

  const addToCart = () => {
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
      image: product.ProductImage?.[0]?.url || '',
    }

    addProductToCart(cartProduct);
    setPosted(false);
    setQuantity(1);
    //setSize(undefined);


  };


  return (
    <>
      {posted && (
        <span className="mt-2 text-red-500 fade-in">
          Debe de seleccionar una talla*
        </span>
      )}

      {/* Selector de Tallas */}
      {/* <SizeSelector
        selectedSize={size}
        availableSizes={product.sizes}
        onSizeChanged={setSize}
      /> */}

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
