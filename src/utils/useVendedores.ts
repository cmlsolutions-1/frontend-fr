// src/utils/useVendedores.ts

import { useEffect, useState } from "react";
import { Vendedor } from "@/components/userGestion/types";

const LOCAL_STORAGE_KEY = "vendedores";

export const useVendedores = () => {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Cargar los vendedores desde localStorage al iniciar
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setVendedores(JSON.parse(stored));
    }
  }, []);

  // Guardar en localStorage cuando cambian los vendedores
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(vendedores));
  }, [vendedores]);

  const agregarVendedor = (nuevoVendedor: Vendedor) => {
    setVendedores((prev) => [...prev, nuevoVendedor]);
  };

  const eliminarVendedor = (id: string) => {
    setVendedores((prev) => prev.filter((vendedor) => vendedor.id !== id));
  };

  return {
    vendedores,
    agregarVendedor,
    eliminarVendedor,
  };
};
