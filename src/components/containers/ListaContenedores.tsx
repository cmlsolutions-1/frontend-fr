
import { Link } from 'react-router-dom';

interface Contenedor {
  id: number 
  nombre: string
  fecha: Date | null
  productos?: any[] 
}

interface ListaContenedoresProps {
  contenedores: Contenedor[]
}

export default function ListaContenedores({ contenedores }: ListaContenedoresProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {contenedores.map((contenedor) => (
        <Link key={contenedor.id} to={`/contenedor/${contenedor.id}`}>
          <div className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer">
            <h2 className="text-lg font-semibold">{contenedor.nombre}</h2>
            <p className="text-gray-500 text-sm">
              Fecha:{' '}
              {contenedor.fecha
                ? new Date(contenedor.fecha).toLocaleDateString()
                : 'Sin fecha'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}