// src/components/ui/pagination/Pagination.tsx
import clsx from "clsx";

interface Props {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ totalPages, currentPage, onPageChange }: Props) => {
  // Configuración del paginador compacto
  const maxVisiblePages = 5; // Número máximo de páginas visibles (excepto inicio y fin)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  // Generar las páginas visibles
  let pages: (number | string)[] = [];

  // Siempre mostrar la primera página
  if (startPage > 1) {
    pages.push(1);
  }

  // Si hay un salto desde la primera página, mostrar puntos suspensivos
  if (startPage > 2) {
    pages.push("...");
  }

  // Añadir las páginas centrales
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Si hay un salto hacia la última página, mostrar puntos suspensivos
  if (endPage < totalPages - 1) {
    pages.push("...");
  }

  // Siempre mostrar la última página (si no es la misma que la actual)
  if (endPage < totalPages) {
    pages.push(totalPages);
  }

  // Manejar el clic en puntos suspensivos
  const handleEllipsisClick = (position: "start" | "end") => {
    if (position === "start") {
      // Ir a la página que está a la mitad del rango
      const newPage = Math.max(1, currentPage - maxVisiblePages);
      onPageChange(newPage);
    } else {
      // Ir a la página que está a la mitad del rango hacia adelante
      const newPage = Math.min(totalPages, currentPage + maxVisiblePages);
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex justify-center mt-10 mb-10">
      <nav>
        <ul className="flex space-x-1">
          {pages.map((page, index) => (
            <li key={index}>
              {page === "..." ? (
                <button
                  onClick={() => handleEllipsisClick(index === 0 ? "start" : "end")}
                  className="px-3 py-1 rounded bg-gray-200 text-gray-600 cursor-pointer"
                >
                  ...
                </button>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={clsx(
                    "px-3 py-1 rounded min-w-[36px]",
                    page === currentPage
                      ? "bg-[#F2B318] text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  )}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};