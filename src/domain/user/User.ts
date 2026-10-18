import type { Paginated } from "@/domain/shared/pagination";

export type UserRole = "CUSTOMER" | "ADMIN";
export type MemberTier = "SILVER" | "GOLD" | "PLATINUM";

/** Pelanggan (dan admin) beserta ringkasan pembeliannya. */
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  tier: MemberTier;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  createdAt: Date;
}

export interface UserFilter {
  query: string;
  page: number;
  limit: number;
}

export interface UserRepository {
  list(filter: UserFilter): Promise<Paginated<User>>;
}

/** Aturan bisnis kecil yang tidak butuh UI maupun server: pelanggan yang pernah belanja ≥ 2 kali. */
export function isRepeatBuyer(user: Pick<User, "ordersCount">): boolean {
  return user.ordersCount >= 2;
}
