// src/pages/AdminContenedorPage.tsx
import { mockProducts } from '../mocks/mock-products';
import { CreateContenedorForm } from '../components/containers/CreateContenedorForm';

export default function AdminContenedorPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear nuevo contenedor</h1>
      <CreateContenedorForm productos={mockProducts} />
    </div>
  );
}
