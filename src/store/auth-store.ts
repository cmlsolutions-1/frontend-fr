// src/store/auth-store.ts
import { create } from "zustand";
import { loginRequest, fetchMe } from "@/services/user.service";

// Este store maneja la autenticación del usuario, incluyendo login, logout y restauración de sesión.
// Utiliza `zustand` para manejar el estado global de autenticación.
// se puedes usar `useAuthStore` en los componentes para acceder al estado de autenticación y las funciones de login/logout.

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

      localStorage.setItem("token", token);

      set({ user, token });
      return true;
    } catch (err) {
      console.error("Login fallido", err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  restoreSession: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const user = await fetchMe(token);
      set({ user, token });
    } catch (err) {
      console.warn("No se pudo restaurar la sesión");
      localStorage.removeItem("token");
    }
  },
}));
