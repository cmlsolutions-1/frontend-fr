
//src/components/ui/pagination/Pagination.tsx
import clsx from "clsx";

interface Props {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ totalPages, currentPage, onPageChange }: Props) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-10 mb-10">
      <nav>
        <ul className="flex space-x-2">
          {pages.map((page) => (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={clsx(
                  "px-3 py-1 rounded",
                  page === currentPage
                    ? "bg-[#F2B318] text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                )}
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
