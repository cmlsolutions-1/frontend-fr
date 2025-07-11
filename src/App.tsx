//src/App.tsx
import React, { useEffect } from 'react';
import { AppRouter } from './router/AppRouter'; 
import { useAuthStore } from './store/auth-store';

// Componente principal de la aplicación que maneja la restauración de sesión al iniciar
// y renderiza el enrutador de la aplicación. 
// Utiliza Zustand para manejar el estado de autenticación y restaurar la sesión desde localStorage.
// Este componente se monta una vez al inicio de la aplicación y no se vuelve a montar durante la navegación. 
// Se encarga de verificar si hay una sesión guardada en localStorage y restaurarla al cargar la aplicación.

const App = () => {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession(); // Intenta restaurar la sesión desde localStorage
  }, []);

  return (
    <div>
      <AppRouter />
    </div>
  );
};

export default App;
