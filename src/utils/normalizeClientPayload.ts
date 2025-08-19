//src/utils/normalizeClientPayload

export function normalizeCliente(cliente: any) {
  const principalEmail = cliente.emails?.find((e: any) => e.IsPrincipal)?.EmailAddres || '';
  const principalPhone = cliente.phones?.find((p: any) => p.IsPrincipal)?.NumberPhone || '';

  return {
    ...cliente,
    email: principalEmail,
    phone: principalPhone,
    salesPerson: cliente.salesPerson, // ya viene como ID directamente
  };
}
