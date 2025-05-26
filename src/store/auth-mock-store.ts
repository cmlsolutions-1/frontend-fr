// src/store/auth-mock-store.ts
import { create } from 'zustand';
import { User } from '@/mocks/mock-users';
import { mockUsers } from '@/mocks/mock-users';

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (email, password) => {
    const foundUser = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      set({ user: foundUser });
      return true;
    }

    return false;
  },
  logout: () => set({ user: null }),
}));