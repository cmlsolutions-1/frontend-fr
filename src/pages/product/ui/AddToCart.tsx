import { useMemo, useState } from "react";
import { QuantitySelector } from "@/components";
import type { CartProduct, Product } from "@/interfaces";
import { useCartStore } from "@/store";
import { useAuthStore } from "@/store/auth-store";

interface Props {
  product: Product;
}

export const AddToCart = ({ product }: Props) => {
  const { user } = useAuthStore();

  const addProductToCart = useCartStore((state) => state.addProductTocart);
  const cart = useCartStore((state) => state.cart);

  const [quantity, setQuantity] = useState<number>(1);
  const [qtyError, setQtyError] = useState("");

  // stock disponible del producto
  const availableStock = product.stock ?? 0;

  // cantidad actual de este producto en el carrito
  const quantityInCart = useMemo(() => {
    const existingProduct = cart.find((item) => item._id === product._id);
    return existingProduct ? existingProduct.quantity : 0;
  }, [cart, product._id]);

  // stock restante real que todavía se puede agregar desde esta pantalla
  const remainingStock = Math.max(availableStock - quantityInCart, 0);

  const handleQuantityChange = (nextQty: number) => {
    if (nextQty < 1) {
      setQtyError("La cantidad mínima permitida es 1.");
      return;
    }

    if (availableStock <= 0) {
      setQtyError("Este producto no tiene stock disponible.");
      return;
    }

    if (remainingStock <= 0) {
      setQtyError("Ya alcanzaste el stock disponible de este producto.");
      return;
    }

    if (nextQty > remainingStock) {
      setQtyError(
        `Stock insuficiente: solo puedes agregar ${remainingStock} unidad(es) más. Verifica la cantidad antes de ingresar.`
      );
      return;
    }

    setQtyError("");
    setQuantity(nextQty);
  };

  const addToCart = () => {
    if (availableStock <= 0) {
      setQtyError("Este producto no tiene stock disponible.");
      return;
    }

    if (quantity < 1) {
      setQtyError("La cantidad mínima permitida es 1.");
      return;
    }

    if (remainingStock <= 0) {
      setQtyError("Ya alcanzaste el stock disponible de este producto.");
      return;
    }

    if (quantity > remainingStock) {
      setQtyError(
        `Stock insuficiente: solo puedes agregar ${remainingStock} unidad(es) más. Verifica la cantidad antes de ingresar.`
      );
      return;
    }

    const cartProduct: CartProduct = {
      ...product,
      quantity,
    };

    addProductToCart(cartProduct);
    setQtyError("");
    setQuantity(1);
  };

  // No mostrar el botón si el rol no es Client
  if (user?.role !== "Client") {
    return null;
  }

  return (
    <>
      <QuantitySelector
        quantity={quantity}
        onQuantityChanged={handleQuantityChange}
      />

      <p className="mt-2 text-sm text-gray-500">
        Stock disponible: {availableStock}
      </p>

      {quantityInCart > 0 && (
        <p className="mt-1 text-sm text-gray-500">
          Ya tienes {quantityInCart} unidad(es) en el carrito.
        </p>
      )}

      {qtyError && (
        <span className="mt-2 block text-sm font-medium text-red-600 fade-in">
          {qtyError}
        </span>
      )}

      <button
        onClick={addToCart}
        disabled={availableStock <= 0 || remainingStock <= 0}
        className="btn-primary my-5 flex items-center justify-center rounded-md border border-transparent bg-[#F2B318] px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-[#F4C048] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Agregar al carrito
      </button>
    </>
  );
};