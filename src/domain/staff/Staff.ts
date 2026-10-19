import type { AdminRole } from "../auth/Auth";

/** Akun web admin (§5.29). Dikelola super admin. */
export interface Staff {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  store: { id: string; name: string } | null;
  createdAt: Date;
}

export interface StaffInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  /** Wajib untuk OUTLET_ADMIN. */
  storeId: string;
}

/** Perubahan akun; `revoke` = cabut akses admin (akun jadi pelanggan biasa). */
export type StaffUpdate = Partial<Omit<StaffInput, "email">> & { revoke?: boolean };

export interface StaffRepository {
  list(): Promise<Staff[]>;
  create(input: StaffInput): Promise<Staff>;
  update(id: string, input: StaffUpdate): Promise<Staff>;
}

export const MIN_PASSWORD = 8;
