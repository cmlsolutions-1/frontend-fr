// src/mocks/mockAuth.ts

import { z } from 'zod';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
};

const mockUsers: User[] = [
  { id: '1', email: 'admin@demo.com', name: 'Admin Demo', role: 'admin' },
  { id: '2', email: 'user@demo.com', name: 'User Demo', role: 'user' },
];

// Simula función authorize
export async function authorizeMock(credentials: any): Promise<User | null> {
  const parsed = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }).safeParse(credentials);

  if (!parsed.success) return null;

  const { email, password } = parsed.data;

  // Aquí solo validamos email y password simple para demo
  // Ejemplo: password fija "123456"
  if (password !== '123456') return null;

  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

  return user ?? null;
}

// Mock de sesión y jwt token (simples)
export function jwtMock(token: any, user?: User) {
  if (user) {
    token.data = user;
  }
  return token;
}

export function sessionMock(session: any, token: any) {
  session.user = token.data;
  return session;
}
