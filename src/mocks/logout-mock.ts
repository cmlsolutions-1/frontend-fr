// src/mocks/logout-mock.ts
export const logout = () => {
  alert('Sesión cerrada (mock)');
  window.location.href = '/';
}
