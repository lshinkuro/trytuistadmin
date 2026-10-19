/** SUPER_ADMIN: semua outlet. OUTLET_ADMIN: hanya `store` (dipaksa juga oleh backend). */
export type AdminRole = "SUPER_ADMIN" | "OUTLET_ADMIN";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  /** Outlet admin outlet; null untuk super admin. */
  store: { id: string; name: string } | null;
}

export function isSuperAdmin(admin: Pick<AdminUser, "role"> | undefined): boolean {
  return admin?.role === "SUPER_ADMIN";
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  login(credentials: Credentials): Promise<AdminUser>;
  logout(): Promise<void>;
  currentAdmin(): Promise<AdminUser>;
}
