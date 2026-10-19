import type { AuditLog } from "@/domain/audit/AuditLog";
import type { AdminUser } from "@/domain/auth/Auth";
import type { Dashboard } from "@/domain/dashboard/Dashboard";
import {
  BANNER_ACTIONS,
  type Banner,
  type BannerActionType,
  type BannerInput,
  type BannerStatus,
} from "@/domain/banner/Banner";
import type { Deal, DealInput, DealStatus } from "@/domain/deal/Deal";
import type { DeliveryOverview, DeliverySettings } from "@/domain/delivery/DeliverySettings";
import {
  ORDER_STATUSES,
  type OrderDetail,
  type OrderStatus,
  type OrderSummary,
  type PaymentMethod,
} from "@/domain/order/Order";
import {
  PAYMENT_STATUSES,
  type PaymentDetail,
  type PaymentOrderRef,
  type PaymentStatus,
  type PaymentSummary,
  type RefundStatus,
} from "@/domain/payment/Payment";
import type { Category, Product, ProductInput } from "@/domain/product/Product";
import type { Store, StoreInput } from "@/domain/store/Store";
import type { MemberTier, User, UserRole } from "@/domain/user/User";
import type {
  AdminBannerDTO,
  AdminMeDTO,
  AdminOrderDTO,
  AdminOrderSummaryDTO,
  AdminPaymentDTO,
  AdminPaymentSummaryDTO,
  AdminProductDTO,
  AdminStoreDTO,
  AuditLogDTO,
  CategoryDTO,
  DashboardDTO,
  DealDTO,
  DeliverySettingsDTO,
  DeliverySettingsResponseDTO,
  PaymentOrderRefDTO,
  UserDTO,
} from "../dto/dtos";

// Mapper = satu-satunya tempat yang tahu bentuk JSON backend.

export function toStatus(value: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value) ? (value as OrderStatus) : "PENDING";
}

const toPayment = (value: string): PaymentMethod =>
  value === "QRIS" || value === "EWALLET" || value === "ONLINE" ? value : "COD";

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
      bundle: (i.bundle_items ?? []).map((b) => `${b.quantity}× ${b.product_name}${b.option_name ? ` (${b.option_name})` : ""}`),
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
    freeDeliveryCoupon: dto.free_delivery_coupon ?? false,
    deliveryFeeWaived: dto.delivery_fee_waived ?? 0,
    distanceKm: dto.distance_km ?? null,
    eta:
      dto.eta_min_minutes != null && dto.eta_max_minutes != null
        ? { minMinutes: dto.eta_min_minutes, maxMinutes: dto.eta_max_minutes }
        : null,
    payment: dto.payment
      ? {
          id: dto.payment.id,
          providerOrderId: dto.payment.provider_order_id,
          status: dto.payment.status,
          paymentType: dto.payment.payment_type,
          refundStatus: dto.payment.refund_status,
          paidAt: dto.payment.paid_at ? new Date(dto.payment.paid_at) : null,
        }
      : null,
  };
}

const toPaymentStatus = (value: string): PaymentStatus =>
  (PAYMENT_STATUSES as readonly string[]).includes(value) ? (value as PaymentStatus) : "PENDING";

const toPaymentOrder = (dto: PaymentOrderRefDTO | null): PaymentOrderRef | null =>
  dto ? { id: dto.id, orderNumber: dto.order_number, status: toStatus(dto.status) } : null;

export function toPaymentSummary(dto: AdminPaymentSummaryDTO): PaymentSummary {
  return {
    id: dto.id,
    providerOrderId: dto.provider_order_id,
    status: toPaymentStatus(dto.status),
    amount: dto.amount,
    refundedAmount: dto.refunded_amount,
    refundStatus: dto.refund_status as RefundStatus | null,
    paymentType: dto.payment_type,
    storeName: dto.store_name,
    customer: dto.customer,
    order: toPaymentOrder(dto.order),
    createdAt: new Date(dto.created_at),
    paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
    expiresAt: new Date(dto.expires_at),
  };
}

export function toPaymentDetail(dto: AdminPaymentDTO): PaymentDetail {
  return {
    id: dto.id,
    providerOrderId: dto.provider_order_id,
    providerTxnId: dto.provider_txn_id,
    status: toPaymentStatus(dto.status),
    amount: dto.amount,
    refundedAmount: dto.refunded_amount,
    refundableAmount: dto.refundable_amount,
    canRefundOnline: dto.can_refund_online,
    refundStatus: dto.refund_status as RefundStatus | null,
    statusMessage: dto.status_message,
    paymentType: dto.payment_type,
    storeName: dto.store.name,
    customer: dto.customer,
    order: toPaymentOrder(dto.order),
    createdAt: new Date(dto.created_at),
    paidAt: dto.paid_at ? new Date(dto.paid_at) : null,
    expiresAt: new Date(dto.expires_at),
    subtotal: dto.quote.subtotal,
    deliveryFee: dto.quote.delivery_fee,
    discount: dto.quote.discount,
    items: dto.quote.items.map((i) => ({
      productName: i.product_name,
      optionName: i.option_name,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    refunds: dto.refunds.map((r) => ({
      id: r.id,
      amount: r.amount,
      reason: r.reason,
      method: r.method === "MANUAL" ? "MANUAL" : "MIDTRANS",
      status: r.status === "SUCCEEDED" || r.status === "FAILED" ? r.status : "PENDING",
      message: r.message,
      adminName: r.admin_name,
      createdAt: new Date(r.created_at),
    })),
    events: dto.events.map((e) => ({
      source: e.source,
      providerStatus: e.provider_status,
      signatureOk: e.signature_ok,
      payload: e.payload,
      createdAt: new Date(e.created_at),
    })),
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
    bundleItems: (dto.bundle_items ?? []).map((b) => ({
      productId: b.product_id,
      productName: b.product_name,
      optionId: b.option_id,
      optionName: b.option_name,
      quantity: b.quantity,
      unitPrice: b.unit_price,
    })),
    separatePrice: dto.separate_price ?? 0,
    updatedAt: new Date(dto.updated_at),
    ...(dto.store
      ? {
          store: {
            storeId: dto.store.store_id,
            isListed: dto.store.is_listed,
            isSoldOut: dto.store.is_sold_out,
            stock: dto.store.stock,
            price: dto.store.price,
            dealPrice: dto.store.deal_price,
            effectivePrice: dto.store.effective_price,
            isAvailable: dto.store.is_available,
          },
        }
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
    listedProducts: dto.listed_products ?? 0,
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
  if (input.bundleItems !== undefined) {
    body.bundle_items = input.bundleItems.map((b) => ({ product_id: b.productId, option_id: b.optionId, quantity: b.quantity }));
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
    store: dto.store_id ? { id: dto.store_id, name: dto.store_name ?? dto.store_id } : null,
    canEdit: dto.can_edit ?? true,
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
  if (input.storeId !== undefined) body.store_id = input.storeId;
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
    role: (["SUPER_ADMIN", "OUTLET_ADMIN"].includes(dto.role) ? dto.role : "CUSTOMER") as UserRole,
    tier: (["SILVER", "GOLD", "PLATINUM"].includes(dto.member_tier) ? dto.member_tier : "SILVER") as MemberTier,
    ordersCount: dto.orders_count,
    totalSpent: dto.total_spent,
    lastOrderAt: dto.last_order_at ? new Date(dto.last_order_at) : null,
    createdAt: new Date(dto.created_at),
  };
}

export function toAdminUser(dto: AdminMeDTO): AdminUser {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    // Role tak dikenal diperlakukan sebagai admin outlet (akses paling sempit).
    role: dto.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "OUTLET_ADMIN",
    store: dto.store_id ? { id: dto.store_id, name: dto.store_name ?? dto.store_id } : null,
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

export function toDeliveryOverview(dto: DeliverySettingsResponseDTO): DeliveryOverview {
  const s = dto.settings;
  return {
    settings: {
      deliveryFee: s.delivery_fee,
      deliveryBaseKm: s.delivery_base_km,
      deliveryFeePerKm: s.delivery_fee_per_km,
      deliveryFeeMax: s.delivery_fee_max,
      freeDeliveryMinSubtotal: s.free_delivery_min_subtotal,
      prepMinutes: s.prep_minutes,
      courierSpeedKmh: s.courier_speed_kmh,
      freeDeliveryCouponEnabled: s.free_delivery_coupon_enabled,
      freeDeliveryCouponWeekly: s.free_delivery_coupon_weekly,
    },
    examples: dto.examples.map((e) => ({
      distanceKm: e.distance_km,
      fee: e.delivery_fee,
      etaMinMinutes: e.eta_min_minutes,
      etaMaxMinutes: e.eta_max_minutes,
    })),
    updatedAt: dto.updated_at ? new Date(dto.updated_at) : null,
  };
}

export function toDeliverySettingsBody(s: DeliverySettings): DeliverySettingsDTO {
  return {
    delivery_fee: s.deliveryFee,
    delivery_base_km: s.deliveryBaseKm,
    delivery_fee_per_km: s.deliveryFeePerKm,
    delivery_fee_max: s.deliveryFeeMax,
    free_delivery_min_subtotal: s.freeDeliveryMinSubtotal,
    prep_minutes: s.prepMinutes,
    courier_speed_kmh: s.courierSpeedKmh,
    free_delivery_coupon_enabled: s.freeDeliveryCouponEnabled,
    free_delivery_coupon_weekly: s.freeDeliveryCouponWeekly,
  };
}

export function toBanner(dto: AdminBannerDTO): Banner {
  return {
    id: dto.id,
    title: dto.title,
    subtitle: dto.subtitle,
    imageUrl: dto.image_url,
    actionType: (BANNER_ACTIONS as readonly string[]).includes(dto.action_type) ? (dto.action_type as BannerActionType) : "NONE",
    actionValue: dto.action_value,
    actionLabel: dto.action_label,
    startsAt: dto.starts_at ? new Date(dto.starts_at) : null,
    endsAt: dto.ends_at ? new Date(dto.ends_at) : null,
    sortOrder: dto.sort_order,
    isActive: dto.is_active,
    status: (["LIVE", "SCHEDULED", "ENDED", "INACTIVE", "HIDDEN"].includes(dto.status) ? dto.status : "INACTIVE") as BannerStatus,
  };
}

export function toBannerBody(input: Partial<BannerInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.subtitle !== undefined) body.subtitle = input.subtitle;
  if (input.imageUrl !== undefined) body.image_url = input.imageUrl;
  if (input.actionType !== undefined) body.action_type = input.actionType;
  if (input.actionValue !== undefined) body.action_value = input.actionValue ?? "";
  if (input.startsAt !== undefined || input.endsAt !== undefined) {
    // Periode dikirim lengkap; keduanya kosong = tampil tanpa batas waktu.
    if (!input.startsAt && !input.endsAt) body.clear_schedule = true;
    else {
      body.clear_schedule = true;
      if (input.startsAt) body.starts_at = input.startsAt.toISOString();
      if (input.endsAt) body.ends_at = input.endsAt.toISOString();
    }
  }
  if (input.sortOrder !== undefined) body.sort_order = input.sortOrder;
  if (input.isActive !== undefined) body.is_active = input.isActive;
  return body;
}
