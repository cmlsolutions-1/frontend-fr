'use server'

export const registerUser = async (name: string, email: string, password: string) => {
  // Simular que el correo ya existe
  if (email === 'admin@admin.com') {
    return {
      ok: false,
      message: 'El correo ya está registrado.',
    };
  }

  return {
    ok: true,
    message: 'Usuario registrado correctamente',
  };
};
