// src/store/auth-mock-store.ts
import { create } from 'zustand';
import { User } from '@/mocks/mock-users';
import { mockUsers } from '@/mocks/mock-users';
import { loginRequest, LoginResponse } from "@/services/authService";

/* interface AuthState {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
} */

  interface AuthState {
  user: LoginResponse["user"] | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  login:async  (email, password) => {
    try {
    const { user, token } = await loginRequest(email, password);

    // Opcional: para guardar token en localStorage
      localStorage.setItem("token", token);

      set({ user, token });
      return true;
    } catch (error) {
      console.error("Login fallido:", error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));