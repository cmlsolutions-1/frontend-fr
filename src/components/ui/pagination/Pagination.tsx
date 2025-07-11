// //src/components/ui/pagination/Pagination.tsx
// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import clsx from 'clsx';
// import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
// import { generatePaginationNumbers } from '@/utils';


// interface Props {
//   totalPages: number;
//   currentPage?: number;
  
// }


// export const Pagination = ({ totalPages }: Props) => {

//   const navigate = useNavigate();
//   const search = window.location.search || window.location.href.split('?')[1] || '';
//   const searchParams = new URLSearchParams(search);

//   const pageString = searchParams.get('page') ?? '1';
//   const currentPage = isNaN(+pageString) ? 1 : +pageString;

//   // Redirigir si el número de página es inválido
//   if (currentPage < 1 || isNaN(+pageString)) {
//     navigate(window.location.pathname);
//   }
 


//   const allPages = generatePaginationNumbers(currentPage, totalPages);


//   const createPageUrl = ( pageNumber: number | string ) => {

//     const params = new URLSearchParams( searchParams.toString() );

//     if (pageNumber === '...') {
//       return `${window.location.pathname}?${params.toString()}`;
//     }

//     if (+pageNumber <= 0) {
//       return window.location.pathname;
//     }

//     if (+pageNumber > totalPages) {
//       return `${window.location.pathname}?${params.toString()}`;
//     }

//     params.set('page', pageNumber.toString());
//     return `${window.location.pathname}?${params.toString()}`;
//   };

//   const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number | string) => {
//     e.preventDefault(); // Evita recargar la página
//     const url = createPageUrl(page);
//     navigate(url);
//   };



//   return (
//     <div className="flex text-center justify-center mt-10 mb-32">

//       <nav aria-label="Page navigation example">

//         <ul className="flex list-style-none">
//           <li className="page-item">
//             <Link
//               className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
//               to={ createPageUrl( currentPage - 1 ) }
//             >
//               <IoChevronBackOutline size={30} />
//             </Link>
//           </li>

//           {
//             allPages.map( (page, index) => (

//               <li key={ page } className="page-item">
//                 <Link
//                   className={
//                     clsx(
//                       "page-link relative block py-1.5 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none",
//                       {
//                         'bg-blue-600 shadow-sm text-white hover:text-white hover:bg-blue-700': page === currentPage
//                       }
//                     )
//                   }
//                   to={ createPageUrl( page ) }
//                 >
//                   { page }
//                 </Link>
//               </li>

//             ))

//           }


          

//           <li className="page-item">
//             <Link
//               className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
//               to={ createPageUrl( currentPage + 1 ) }
//             >
//               <IoChevronForwardOutline size={30} />
//             </Link>
//           </li>
//         </ul>
//       </nav>
//     </div>
//   );
// };
// src/components/ui/Pagination.tsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { generatePaginationNumbers } from '@/utils';

interface Props {
  totalPages: number;
  currentPage?: number;
}

export const Pagination = ({ totalPages, currentPage = 1 }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Obtén la página actual desde la URL si no se pasa como prop
  const searchParams = new URLSearchParams(location.search);
  const pageString = searchParams.get('page') ?? '1';
  const activePage = isNaN(+pageString) ? 1 : +pageString;
  
  // Genera números de página
  const allPages = generatePaginationNumbers(activePage, totalPages);

  const createPageUrl = (pageNumber: number | string) => {
    if (pageNumber === '...') return '#';
    const params = new URLSearchParams(searchParams.toString());
    if (+pageNumber <= 0) return `${location.pathname}`;
    params.set('page', pageNumber.toString());
    return `${location.pathname}?${params.toString()}`;
  };

  const handlePageClick = (e: React.MouseEvent<HTMLAnchorElement>, page: number | string) => {
    if (page === '...' || page === 'prev' || page === 'next') return e.preventDefault();

    e.preventDefault();
    navigate(createPageUrl(page));
  };

  return (
    <div className="flex justify-center mt-10 mb-10">
      <nav aria-label="Page navigation example">
        <ul className="flex list-style-none">
          <li className="page-item">
            <Link
              className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              to={createPageUrl(currentPage - 1)}
              onClick={(e) => handlePageClick(e, 'prev')}
            >
              <IoChevronBackOutline size={30} />
            </Link>
          </li>

          {allPages.map((page, index) => (
            <li key={index} className="page-item">
              <Link
                className={clsx(
                  "page-link relative block py-1.5 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200",
                  {
                    'bg-blue-600 text-white hover:bg-blue-700': page === activePage,
                  }
                )}
                to={createPageUrl(page)}
                onClick={(e) => handlePageClick(e, page)}
              >
                {page}
              </Link>
            </li>
          ))}

          <li className="page-item">
            <Link
              className="page-link relative block py-1.5 px-3 border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              to={createPageUrl(currentPage + 1)}
              onClick={(e) => handlePageClick(e, 'next')}
            >
              <IoChevronForwardOutline size={30} />
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};