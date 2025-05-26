// src/mocks/contenedor/createMockContenedor.ts

type CreateContenedorParams = {
  nombre: string
  fecha: string
  productos: string[]
}

export async function createMockContenedor({
  nombre,
  fecha,
  productos
}: CreateContenedorParams) {
  const nuevoContenedor = {
    id: crypto.randomUUID(),
    nombre,
    fecha,
    productos
  }

  const actuales = JSON.parse(localStorage.getItem('mockContenedores') || '[]')
  localStorage.setItem('mockContenedores', JSON.stringify([...actuales, nuevoContenedor]))

  console.log('[Mock] Contenedor creado:', nuevoContenedor)
  return nuevoContenedor
}
