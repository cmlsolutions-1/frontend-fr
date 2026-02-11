// src/components/ui/ClientSearch.tsx
import React, { useEffect, useRef, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import type { Cliente } from "@/interfaces/user.interface";

interface Props {
  clientes: Cliente[];
  onResults: (results: Cliente[]) => void;
}

export const ClientSearch: React.FC<Props> = ({ clientes, onResults }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const clientesRef = useRef<Cliente[]>(clientes);

  useEffect(() => {
    clientesRef.current = clientes;
    // si cambian los clientes y no hay término, refrescar resultados
    if (!searchTerm.trim()) onResults(clientes);
  }, [clientes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const search = () => {
      if (!searchTerm.trim()) {
        onResults(clientesRef.current);
        setLoading(false);
        return;
      }

      setLoading(true);
      const term = searchTerm.toLowerCase().trim();

      const results = clientesRef.current.filter((c) => {
        const fullName = `${c.name ?? ""} ${c.lastName ?? ""}`.toLowerCase();
        const nit = (c.id ?? "").toLowerCase();

        return (
          fullName.includes(term) ||
          (c.name ?? "").toLowerCase().includes(term) ||
          (c.lastName ?? "").toLowerCase().includes(term) ||
          nit.includes(term)
        );
      });

      onResults(results);
      setLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, onResults]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Buscar cliente por Nit o nombre..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="block w-full pl-12 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#F4C048] focus:border-[#F2B318] text-sm"
      />
      <IoSearchOutline className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />

      {loading && (
        <span className="absolute right-4 top-2.5 text-xs text-gray-400">
          buscando...
        </span>
      )}
    </div>
  );
};
