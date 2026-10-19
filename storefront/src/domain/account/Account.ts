export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  notes: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id">;

export interface PaymentMethod {
  id: string;
  /** COD | QRIS | EWALLET | ONLINE */
  type: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  isDefault: boolean;
}

export interface AccountRepository {
  me(): Promise<Profile>;
  addresses(): Promise<Address[]>;
  createAddress(input: AddressInput): Promise<Address>;
  updateAddress(id: string, input: Partial<AddressInput>): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
  paymentMethods(): Promise<{ defaultId: string; methods: PaymentMethod[] }>;
}
