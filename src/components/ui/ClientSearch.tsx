// src/components/ui/ClientSearch.tsx
import React, { useState, useEffect, useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { getClientById } from "@/services/client.service";
import type { Cliente } from "@/interfaces/user.interface";

interface Props {
  clientes: Cliente[]; 
  onResults: (results: Cliente[]) => void; 
}

export const ClientSearch: React.FC<Props> = ({ clientes, onResults }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Usar useRef para mantener una referencia actualizable de clientes
  const clientesRef = useRef<Cliente[]>(clientes);
  // Actualizar la referencia cada vez que clientes cambie
  useEffect(() => {
    clientesRef.current = clientes;
  }, [clientes]);

  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        onResults(clientesRef.current); 
        return;
      }

      setLoading(true);
      try {
        let results: Cliente[] = [];

        if (/^[a-zA-Z0-9-]+$/.test(searchTerm)) {
          try {
            const client = await getClientById(searchTerm);
            if (client) results = [client];
          } catch (apiError) {
            // Si la API falla (por ejemplo, 404), continuar con búsqueda local
            console.warn("Cliente no encontrado por ID:", apiError);
          }
        }

        if (results.length === 0) {
          const term = searchTerm.toLowerCase();
          results = clientesRef.current.filter( // Usar la referencia actualizada
            (c) =>
              c.name.toLowerCase().includes(term) ||
              c.lastName.toLowerCase().includes(term) ||
              c.id.toLowerCase().includes(term)
          );
        }

        onResults(results);
      } catch (err) {
        console.error("Error en la búsqueda:", err);
        onResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 400); // Debounce 400ms
    return () => clearTimeout(debounce);
  }, [searchTerm]); 

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