
import { useState } from 'react'
//import { createContenedor } from '@/actions/contenedor/createContenedor'
import { createMockContenedor } from '@/mocks/contenedor/createMockContenedor'

type Product = {
  id: string
  title: string
  reference: string
}

export function CreateContenedorForm({ productos }: { productos: Product[] }) {
  const [nombre, setNombre] = useState('')
  const [fecha, setFecha] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await createMockContenedor({ nombre, fecha, productos: selectedProducts })
    setLoading(false)
    setNombre('')
    setFecha('')
    setSelectedProducts([])
    alert('Contenedor creado con éxito')
  }

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const filteredProducts = productos.filter((p) =>
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Nombre del contenedor"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />

      <h2 className="text-lg font-semibold mt-4">Productos</h2>

      <input
        type="text"
        placeholder="Buscar por referencia..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 w-full rounded mb-2"
      />

      <div className="max-h-64 overflow-y-scroll border p-2 space-y-1 rounded bg-white">
        {filteredProducts.length === 0 && (
          <p className="text-sm text-gray-500">No se encontraron productos.</p>
        )}
        {filteredProducts.map((p) => (
          <label key={p.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedProducts.includes(p.id)}
              onChange={() => handleSelectProduct(p.id)}
            />
            <span>
              <strong>{p.reference}</strong> - {p.title}
            </span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-all"
      >
        {loading ? 'Creando...' : 'Crear contenedor'}
      </button>
    </form>
  )
}
