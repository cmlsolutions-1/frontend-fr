// src/services/cart.service.ts

import { CartItem } from "@/interfaces/cart.interface";
import { mockProducts } from "@/mocks/mock-products";


const API_URL = import.meta.env.VITE_API_URL;

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn("Usando carrito local. No hay conexión con el backend.");
      return mockProducts.map((product) => ({
        ...product,
        quantity: 1,
      }));
    }

    return await response.json(); // Debe devolver array de CartItem
  } catch (error) {
    console.error("Error al obtener carrito del backend:", error);
    return mockProducts.map((product) => ({
      ...product,
      quantity: 1,
    }));
  }
};

export const updateCartItemQuantity = async (
  productId: string,
  quantity: number
): Promise<CartItem | null> => {
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) throw new Error("No se pudo actualizar la cantidad");

    return await response.json();
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    return null;
  }
};

export const removeCartItem = async (productId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("No se pudo eliminar del carrito:", error);
    return false;
  }
};