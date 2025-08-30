// src/store/auth-store.ts
import { create } from "zustand";
import { loginRequest, fetchMe } from "@/services/user.service";


interface AuthState {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,

  login: async (email, password) => {
    try {
      const { user, token } = await loginRequest(email, password);

      // Almacenar con la estructura correcta que esperan tus servicios
      const authData = {
        state: {
          token: token,
          user: user
        }
      };

      localStorage.setItem('auth-storage', JSON.stringify(authData));

      set({ user, token });
      return true;
    } catch (err) {
      console.error("Login fallido", err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('auth-storage');
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    try {
      // Leer desde la estructura correcta
      const authData = localStorage.getItem('auth-storage');
      if (!authData) return;

      const parsed = JSON.parse(authData);
      const token = parsed.state?.token;
      const user = parsed.state?.user;
      
      if (!token) return;

      // Verificar si el token es válido (opcional)
      // const userData = await fetchMe(token);
      
      set({ user, token });
    } catch (err) {
      console.warn("No se pudo restaurar la sesión");
      localStorage.removeItem('auth-storage');
    }
  },
}));