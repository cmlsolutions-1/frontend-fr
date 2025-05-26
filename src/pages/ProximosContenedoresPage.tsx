// src/pages/ProximosContenedoresPage.tsx
import { mockContenedores } from '../mocks/mock-contenedores';
import { Link } from 'react-router-dom';

export default function ProximosContenedoresPage() {
  const contenedores = mockContenedores;

  return (
    <main className="px-10">
      <h1 className="text-2xl font-bold mb-6">Próximos Contenedores</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {contenedores.map((contenedor) => (
          <Link
            key={contenedor.id}
            to={`/contenedor/${contenedor.id}`}
            className="border p-4 rounded-xl shadow hover:shadow-lg transition-all text-center hover:text-blue-600 font-semibold bg-white"
          >
            <div className="w-full h-32 mb-3 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              
              <img
                src="/imgs/contendor.png"
                alt={`Contenedor ${contenedor.nombre}`}
                className="object-contain max-h-full max-w-full"
              />
            </div>
            <span className="block capitalize">{contenedor.nombre}</span>
            <span className="block text-sm text-gray-500">
              {contenedor.fecha
                ? new Date(contenedor.fecha).toLocaleDateString()
                : 'Sin fecha'}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
