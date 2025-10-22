// src/store/auth-store.ts
import { create } from "zustand";
import { loginRequest, fetchMe } from "@/services/user.service";
import { persist } from "zustand/middleware";


interface AuthState {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        try {
          const { user, token } = await loginRequest(email, password);

          set({ user, token }); // persist guarda esto automáticamente
          return true;
        } catch (err) {
          console.error("Login fallido", err);
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null }); //  persist borra del storage
      },

      restoreSession: async () => {
        try {
          const token = get().token;
          if (!token) return;

          const userData = await fetchMe(token);
          set({ user: userData, token });
        } catch (err) {
          console.warn("No se pudo restaurar la sesión", err);
          set({ user: null, token: null });
        }
      },
    }),
    {
      name: "auth-storage", //  clave en localStorage
      partialize: (state) => ({ token: state.token, user: state.user }), // solo guarda estos
    }
  )
);