import { Cliente } from "@/interfaces";
import { UpdateUserDto } from "@/interfaces/update-user";


export const normalizeClientPayload = (
  cliente: Cliente
): Partial<UpdateUserDto> => {
  return {
    id: cliente.id,
    name: cliente.name?.trim(),
    lastName: cliente.lastName?.trim(),
    emails: cliente.emails?.map(e => ({
      emailAddress: e.emailAddress?.trim(),
      isPrincipal: e.isPrincipal,
    })),
    phones: cliente.phones?.map(p => ({
      numberPhone: p.numberPhone?.replace(/\D/g, ""),
      indicative: p.indicative,
      isPrincipal: p.isPrincipal,
    })),
    address: cliente.address?.length ? cliente.address : undefined,
    city: cliente.city,
    priceCategory: cliente.priceCategory,
    idSalesPerson: cliente.salesPerson, // ✅ nombre correcto
    state: cliente.state === "activo" ? "Active" : "Inactive",
  };
};