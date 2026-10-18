import type { AuditLog } from "@/domain/audit/AuditLog";
import type { Dashboard } from "@/domain/dashboard/Dashboard";
import type { Deal, DealInput, DealStatus } from "@/domain/deal/Deal";
import {
  ORDER_STATUSES,
  type OrderDetail,
  type OrderStatus,
  type OrderSummary,
  type PaymentMethod,
} from "@/domain/order/Order";
import type { Category, Product, ProductInput } from "@/domain/product/Product";
import type { Store, StoreInput } from "@/domain/store/Store";
import type { MemberTier, User, UserRole } from "@/domain/user/User";
import type {
  AdminOrderDTO,
  AdminOrderSummaryDTO,
  AdminProductDTO,
  AdminStoreDTO,
  AuditLogDTO,
  CategoryDTO,
  DashboardDTO,
  DealDTO,
  UserDTO,
} from "../dto/dtos";

// Mapper = satu-satunya tempat yang tahu bentuk JSON backend.

export function toStatus(value: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value) ? (value as OrderStatus) : "PENDING";
}

const toPayment = (value: string): PaymentMethod =>
  value === "QRIS" || value === "EWALLET" ? value : "COD";

export function toOrderSummary(dto: AdminOrderSummaryDTO): OrderSummary {
  return {
    id: dto.order_id,
    orderNumber: dto.order_number,
    status: toStatus(dto.status),
    total: dto.total,
    paymentMethod: toPayment(dto.payment_method),
    itemSummary: dto.item_summary,
    quantity: dto.qty,
    storeId: dto.store_id,
    storeName: dto.store_name,
    customer: dto.customer,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function toOrderDetail(dto: AdminOrderDTO): OrderDetail {
  return {
    id: dto.order_id,
    orderNumber: dto.order_number,
    status: toStatus(dto.status),
    subtotal: dto.subtotal,
    deliveryFee: dto.delivery_fee,
    discount: dto.discount,
    total: dto.total,
    paymentMethod: toPayment(dto.payment_method),
    paymentProvider: dto.payment_provider,
    paymentAccountMasked: dto.payment_account_masked,
    voucherCode: dto.voucher_code,
    note: dto.note,
    createdAt: new Date(dto.created_at),
    storeName: dto.store.name,
    storeAddress: dto.store.address,
    address: dto.address
      ? {
          label: dto.address.label,
          recipient: dto.address.recipient,
          phone: dto.address.phone,
          address: dto.address.address,
          notes: dto.address.notes,
        }
      : null,
    items: dto.items.map((i) => ({
      productId: i.product_id,
      productName: i.product_name,
      optionName: i.option_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      note: i.note,
      subtotal: i.subtotal,
    })),
    history: dto.status_history.map((h) => ({
      status: toStatus(h.status),
      at: new Date(h.at),
      note: h.note,
      changedBy: h.changed_by,
    })),
    rating: dto.rating ? { rating: dto.rating.rating, comment: dto.rating.comment } : null,
    customer: dto.customer,
    nextStatuses: dto.next_statuses.map(toStatus),
  };
}

export function toProduct(dto: AdminProductDTO): Product {
  return {
    id: dto.product_id,
    name: dto.product_name,
    description: dto.description,
    categoryId: dto.category_id,
    categoryName: dto.category_name,
    price: dto.price,
    dealPrice: dto.deal_price,
    effectivePrice: dto.effective_price,
    imageUrl: dto.image_url,
    rating: dto.rating,
    soldCount: dto.sold_count,
    isAvailable: dto.is_available,
    isBestSeller: dto.is_best_seller,
    options: dto.options.map((o) => ({ id: o.id, name: o.name, extraPrice: o.extra_price })),
    updatedAt: new Date(dto.updated_at),
    ...(dto.store_available !== undefined
      ? { store: { isAvailable: dto.store_available, isSoldOutHere: dto.store_sold_out ?? false } }
      : {}),
  };
}

export function toStore(dto: AdminStoreDTO): Store {
  return {
    id: dto.id,
    name: dto.name,
    address: dto.address,
    lat: dto.lat,
    lng: dto.lng,
    phone: dto.phone,
    opensAt: dto.opens_at,
    closesAt: dto.closes_at,
    hoursLabel: dto.hours_label,
    deliveryRadiusKm: dto.delivery_radius_km,
    isActive: dto.is_active,
    isTemporarilyClosed: dto.is_temporarily_closed,
    isOpenNow: dto.is_open_now,
    sortOrder: dto.sort_order,
    unavailableProducts: dto.unavailable_products,
    today: dto.today,
  };
}

/** Body POST/PATCH /v1/admin/stores. */
export function toStoreBody(input: Partial<StoreInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body.name = input.name;
  if (input.address !== undefined) body.address = input.address;
  if (input.lat !== undefined) body.lat = input.lat;
  if (input.lng !== undefined) body.lng = input.lng;
  if (input.phone !== undefined) body.phone = input.phone;
  if (input.opensAt !== undefined) body.opens_at = input.opensAt;
  if (input.closesAt !== undefined) body.closes_at = input.closesAt;
  if (input.deliveryRadiusKm !== undefined) body.delivery_radius_km = input.deliveryRadiusKm;
  if (input.isActive !== undefined) body.is_active = input.isActive;
  if (input.isTemporarilyClosed !== undefined) body.is_temporarily_closed = input.isTemporarilyClosed;
  return body;
}

/** Body POST/PATCH /v1/admin/products. Field yang tidak ada di `input` tidak dikirim. */
export function toProductBody(input: Partial<ProductInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.categoryId !== undefined) body.category_id = input.categoryId;
  if (input.name !== undefined) body.product_name = input.name;
  if (input.description !== undefined) body.description = input.description;
  if (input.price !== undefined) body.price = input.price;
  if (input.imageUrl !== undefined) body.image_url = input.imageUrl;
  if (input.isAvailable !== undefined) body.is_available = input.isAvailable;
  if (input.isBestSeller !== undefined) body.is_best_seller = input.isBestSeller;
  if (input.options !== undefined) {
    body.options = input.options.map((o) => ({ ...(o.id ? { id: o.id } : {}), name: o.name, extra_price: o.extraPrice }));
  }
  return body;
}

export const toCategory = (dto: CategoryDTO): Category => ({ id: dto.id, name: dto.name, icon: dto.icon });

const DEAL_STATUSES: DealStatus[] = ["ACTIVE", "SCHEDULED", "EXPIRED", "INACTIVE"];

export function toDeal(dto: DealDTO): Deal {
  return {
    id: dto.id,
    productId: dto.product_id,
    productName: dto.product_name,
    productPrice: dto.product_price,
    title: dto.title,
    subtitle: dto.subtitle,
    badge: dto.badge,
    imageUrl: dto.image_url,
    dealPrice: dto.deal_price,
    discountPercent: dto.discount_percent,
    startsAt: new Date(dto.starts_at),
    endsAt: new Date(dto.ends_at),
    isActive: dto.is_active,
    showAsPopup: dto.show_as_popup,
    sortOrder: dto.sort_order,
    status: (DEAL_STATUSES as string[]).includes(dto.status) ? (dto.status as DealStatus) : "INACTIVE",
  };
}

/** Body POST/PATCH /v1/admin/deals. Field yang tidak ada di `input` tidak dikirim. */
export function toDealBody(input: Partial<DealInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.productId !== undefined) body.product_id = input.productId;
  if (input.title !== undefined) body.title = input.title;
  if (input.subtitle !== undefined) body.subtitle = input.subtitle;
  if (input.badge !== undefined) body.badge = input.badge;
  if (input.imageUrl !== undefined) body.image_url = input.imageUrl;
  if (input.dealPrice !== undefined) body.deal_price = input.dealPrice;
  if (input.startsAt !== undefined) body.starts_at = input.startsAt.toISOString();
  if (input.endsAt !== undefined) body.ends_at = input.endsAt.toISOString();
  if (input.isActive !== undefined) body.is_active = input.isActive;
  if (input.showAsPopup !== undefined) body.show_as_popup = input.showAsPopup;
  if (input.sortOrder !== undefined) body.sort_order = input.sortOrder;
  return body;
}

export function toDashboard(dto: DashboardDTO): Dashboard {
  return {
    range: dto.range,
    sales: {
      revenue: dto.sales.revenue,
      ordersCompleted: dto.sales.orders_completed,
      averageOrderValue: dto.sales.average_order_value,
      itemsSold: dto.sales.items_sold,
      discountTotal: dto.sales.discount_total,
      deliveryFeeTotal: dto.sales.delivery_fee_total,
      revenueChangePct: dto.sales.revenue_change_pct,
    },
    purchases: {
      orders: dto.purchases.orders,
      buyers: dto.purchases.buyers,
      newBuyers: dto.purchases.new_buyers,
      repeatBuyers: dto.purchases.repeat_buyers,
      inProgress: dto.purchases.in_progress,
      failed: dto.purchases.failed,
      cancelled: dto.purchases.cancelled,
      successRatePct: dto.purchases.success_rate_pct,
      grossValue: dto.purchases.gross_value,
      ordersChangePct: dto.purchases.orders_change_pct,
    },
    daily: dto.daily.map((d) => ({
      date: d.date,
      revenue: d.revenue,
      orders: d.orders,
      ordersCompleted: d.orders_completed,
    })),
    byStatus: dto.by_status.map((s) => ({ status: toStatus(s.status), count: s.count, total: s.total })),
    topProducts: dto.top_products.map((p) => ({
      productId: p.product_id,
      productName: p.product_name,
      quantity: p.quantity,
      revenue: p.revenue,
    })),
    paymentMethods: dto.payment_methods.map((p) => ({ method: toPayment(p.method), count: p.count, total: p.total })),
    storeId: dto.store_id ?? null,
    byStore: (dto.by_store ?? []).map((s) => ({
      storeId: s.store_id,
      storeName: s.store_name,
      orders: s.orders,
      ordersCompleted: s.orders_completed,
      revenue: s.revenue,
      successRatePct: s.success_rate_pct,
    })),
  };
}

export function toUser(dto: UserDTO): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone,
    role: (dto.role === "ADMIN" ? "ADMIN" : "CUSTOMER") as UserRole,
    tier: (["SILVER", "GOLD", "PLATINUM"].includes(dto.member_tier) ? dto.member_tier : "SILVER") as MemberTier,
    ordersCount: dto.orders_count,
    totalSpent: dto.total_spent,
    lastOrderAt: dto.last_order_at ? new Date(dto.last_order_at) : null,
    createdAt: new Date(dto.created_at),
  };
}

export function toAuditLog(dto: AuditLogDTO): AuditLog {
  return {
    id: dto.id,
    action: dto.action,
    entity: dto.entity,
    entityId: dto.entity_id,
    summary: dto.summary,
    adminName: dto.admin_name,
    createdAt: new Date(dto.created_at),
  };
}
