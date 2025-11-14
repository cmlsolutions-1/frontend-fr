//src/App.tsx
import React, { useEffect } from 'react';
import { AppRouter } from './router/AppRouter'; 
import { useAuthStore } from './store/auth-store';


const App = () => {
  const restoreSession = useAuthStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <div>
      <AppRouter />
    </div>
  );
};

export default App;
