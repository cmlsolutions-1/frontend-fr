// src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/ui/LoginForm'; // Importamos el formulario

export default function LoginPage() {
  return <LoginForm />;
}
    // <div className="h-screen flex items-center justify-center bg-gray-100">
    //   <div className="bg-white p-10 rounded shadow-md w-full max-w-md">
    //     <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>
    //     <LoginForm />
    //   </div>
    // </div>
//   );
// }