// src/store/useAddressStore.ts
import { create } from 'zustand';

interface Address {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

interface AddressState {
  address: Address;
}
export const useAddressStore = create<AddressState>(() => ({
  address: {
    firstName: 'Carlos',
    lastName: 'Pérez',
    address: 'Calle 123 #45 - Armenia',
    postalCode: '670000',
    city: 'Armenia',
    country: 'Colombia',
    phone: '3101234567',
  },
}));