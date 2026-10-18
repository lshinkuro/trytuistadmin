import type { OrderFilter } from "@/domain/order/Order";
import type { ProductFilter } from "@/domain/product/Product";
import type { DateRange } from "@/domain/shared/dateRange";
import type { UserFilter } from "@/domain/user/User";

export const queryKeys = {
  admin: ["admin", "me"] as const,
  dashboard: (range: DateRange, storeId: string) => ["dashboard", range, storeId] as const,
  stores: ["stores"] as const,
  orders: (filter: OrderFilter) => ["orders", "list", filter] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  products: (filter: ProductFilter) => ["products", filter] as const,
  categories: ["categories"] as const,
  deals: ["deals"] as const,
  users: (filter: UserFilter) => ["users", filter] as const,
  audit: (page: number) => ["audit", page] as const,
};
