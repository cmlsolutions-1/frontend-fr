export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
}

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '123456',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: '123456',
    name: 'Regular User',
    role: 'user',
  },
];