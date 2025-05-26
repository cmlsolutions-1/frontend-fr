
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { generatePaginationNumbers } from '@/utils';


interface Props {
  totalPages: number;
}


export const Pagination = ({ totalPages }: Props) => {

  const navigate = useNavigate();
  const search = window.location.search || window.location.href.split('?')[1] || '';
  const searchParams = new URLSearchParams(search);

  const pageString = searchParams.get('page') ?? '1';
  const currentPage = isNaN(+pageString) ? 1 : +pageString;

  // Redirigir si el número de página es inválido
  if (currentPage < 1 || isNaN(+pageString)) {
    navigate(window.location.pathname);
  }
 


  const allPages = generatePaginationNumbers(currentPage, totalPages);


  const createPageUrl = ( pageNumber: number | string ) => {

    const params = new URLSearchParams( searchParams.toString() );

    if (pageNumber === '...') {
      return `${window.location.pathname}?${params.toString()}`;
    }

    if (+pageNumber <= 0) {
      return window.location.pathname;
    }

    if (+pageNumber > totalPages) {
      return `${window.location.pathname}?${params.toString()}`;
    }

    params.set('page', pageNumber.toString());
    return `${window.location.pathname}?${params.toString()}`;
  };

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number | string) => {
    e.preventDefault(); // Evita recargar la página
    const url = createPageUrl(page);
    navigate(url);
  };



  return (
    <div className="flex text-center justify-center mt-10 mb-32">

      <nav aria-label="Page navigation example">

        <ul className="flex list-style-none">
          <li className="page-item">
            <Link
              className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              to={ createPageUrl( currentPage - 1 ) }
            >
              <IoChevronBackOutline size={30} />
            </Link>
          </li>

          {
            allPages.map( (page, index) => (

              <li key={ page } className="page-item">
                <Link
                  className={
                    clsx(
                      "page-link relative block py-1.5 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none",
                      {
                        'bg-blue-600 shadow-sm text-white hover:text-white hover:bg-blue-700': page === currentPage
                      }
                    )
                  }
                  to={ createPageUrl( page ) }
                >
                  { page }
                </Link>
              </li>

            ))

          }


          

          <li className="page-item">
            <Link
              className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              to={ createPageUrl( currentPage + 1 ) }
            >
              <IoChevronForwardOutline size={30} />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
