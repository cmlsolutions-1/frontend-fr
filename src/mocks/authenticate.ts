'use server';

import { useMockAuthStore } from '@/store/auth-mock-store';

export const authenticate = async (
  _prevState: string | undefined,
  formData: FormData
): Promise<string> => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Este método ya simula el login y devuelve "Success" o "CredentialsSignin"
  const { login } = useMockAuthStore.getState();
  return login(email, password);
};
