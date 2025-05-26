// src/mocks/authConfigMock.ts

import Credentials from 'next-auth/providers/credentials';

import {
  authorizeMock,
  jwtMock,
  sessionMock
} from './mockAuth';

export const authConfigMock = {
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/new-account',
  },

  callbacks: {
  authorized({ auth, request: { nextUrl } }: { auth?: any; request: { nextUrl?: any } }) {
    return true;
  },

  jwt({ token, user }: { token: any; user?: any }) {
    return jwtMock(token, user);
  },

  session({ session, token }: { session: any; token: any }) {
    return sessionMock(session, token);
  },
},

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        return await authorizeMock(credentials);
      },
    }),
  ],
};
