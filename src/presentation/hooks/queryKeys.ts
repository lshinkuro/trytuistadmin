import type { OrderFilter } from "@/domain/order/Order";
import type { DeliveryPreviewInput } from "@/domain/delivery/DeliverySettings";
import type { PaymentFilter } from "@/domain/payment/Payment";
import type { ProductFilter } from "@/domain/product/Product";
import type { DateRange } from "@/domain/shared/dateRange";
import type { UserFilter } from "@/domain/user/User";

export const queryKeys = {
  admin: ["admin", "me"] as const,
  dashboard: (range: DateRange, storeId: string) => ["dashboard", range, storeId] as const,
  stores: ["stores"] as const,
  orders: (filter: OrderFilter) => ["orders", "list", filter] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  payments: (filter: PaymentFilter) => ["payments", "list", filter] as const,
  payment: (id: string) => ["payments", "detail", id] as const,
  delivery: ["delivery"] as const,
  banners: ["banners"] as const,
  deliveryPreview: (input: DeliveryPreviewInput) => ["delivery", "preview", input] as const,
  products: (filter: ProductFilter) => ["products", filter] as const,
  categories: ["categories"] as const,
  adminCategories: ["categories", "admin"] as const,
  staff: ["staff"] as const,
  deals: ["deals"] as const,
  users: (filter: UserFilter) => ["users", filter] as const,
  audit: (page: number) => ["audit", page] as const,
};
