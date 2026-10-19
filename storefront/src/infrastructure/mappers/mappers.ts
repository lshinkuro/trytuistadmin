// Satu-satunya tempat yang tahu bentuk JSON backend (snake_case). Kontrak: trytuist-api/docs/openapi.yaml.
import type { Address, AddressInput, PaymentMethod, Profile } from "@/domain/account/Account";
import type { Banner, Category, Product, Store } from "@/domain/catalog/Catalog";
import type { OrderDetail, OrderLine, OrderSummary, PaymentSession, Quote, QuoteRequest } from "@/domain/order/Order";

/* eslint-disable @typescript-eslint/no-explicit-any -- DTO longgar; field baru dari backend diabaikan */
type Json = any;

export const toStore = (d: Json): Store => ({
  id: d.id,
  name: d.name,
  address: d.address ?? "",
  isOpen: Boolean(d.is_open),
  hoursLabel: d.hours_label ?? "",
  distanceKm: d.distance_km ?? null,
  isDeliverable: d.is_deliverable ?? null,
  closedNote: d.closed_note ?? null,
});

export function toBanner(d: Json): Banner {
  const t = d.action?.type;
  const v = d.action?.value;
  const action: Banner["action"] =
    t === "PRODUCT" && v ? { type: "PRODUCT", productId: v }
      : t === "CATEGORY" && v ? { type: "CATEGORY", categoryId: v }
        : t === "FREE_DELIVERY" ? { type: "FREE_DELIVERY" }
          : { type: "NONE" };
  return { id: d.id, title: d.title, subtitle: d.subtitle ?? "", imageUrl: d.image_url ?? "", action };
}

export const toCategory = (d: Json): Category => ({ id: d.id, name: d.name, icon: d.icon ?? "" });

export const toProduct = (d: Json): Product => ({
  id: d.product_id,
  name: d.product_name,
  description: d.description ?? "",
  categoryId: d.category_id,
  price: d.price,
  originalPrice: d.original_price != null && d.original_price > d.price ? d.original_price : null,
  discountPercent: d.discount_percent ?? 0,
  imageUrl: d.image_url ?? "",
  rating: d.rating ?? 0,
  soldCount: d.sold_count ?? 0,
  isAvailable: d.is_available !== false,
  isBestSeller: (d.tags ?? []).includes("best_seller"),
  options: (d.options ?? []).map((o: Json) => ({ id: o.id, name: o.name, extraPrice: o.extra_price ?? 0 })),
  combo:
    d.combo && (d.combo.items ?? []).length > 0
      ? {
          items: d.combo.items.map((i: Json) => ({ name: i.product_name, optionName: i.option_name ?? null, quantity: i.quantity ?? 1 })),
          separatePrice: d.combo.separate_price ?? 0,
          savings: Math.max(d.combo.savings ?? 0, 0),
        }
      : null,
});

export const toQuoteBody = (r: QuoteRequest) => ({
  ...(r.storeId ? { store_id: r.storeId } : {}),
  ...(r.addressId ? { address_id: r.addressId } : {}),
  use_free_delivery: r.useFreeDelivery,
  items: r.items.map((i) => ({ product_id: i.productId, option_id: i.optionId, quantity: i.quantity, note: i.note })),
});

const eta = (d: Json) => (d.eta_min_minutes != null && d.eta_max_minutes != null ? { min: d.eta_min_minutes, max: d.eta_max_minutes } : null);

export const toQuote = (d: Json): Quote => ({
  storeName: d.store_name ?? "",
  subtotal: d.subtotal,
  deliveryFee: d.delivery_fee,
  discount: d.discount ?? 0,
  total: d.total,
  distanceKm: d.distance_km ?? null,
  eta: eta(d),
  freeDelivery: d.free_delivery
    ? {
        enabled: Boolean(d.free_delivery.enabled),
        weeklyQuota: d.free_delivery.weekly_quota ?? 0,
        remaining: d.free_delivery.remaining ?? 0,
        applied: Boolean(d.free_delivery.applied),
        feeWaived: d.free_delivery.fee_waived ?? 0,
      }
    : null,
});

export const toPayment = (d: Json): PaymentSession => ({
  id: d.id,
  status: d.status,
  amount: d.amount,
  expiresAt: new Date(d.expires_at),
  redirectUrl: d.redirect_url ?? null,
  statusMessage: d.status_message ?? null,
  orderId: d.order?.id ?? null,
});

export const toOrderSummary = (d: Json): OrderSummary => ({
  id: d.order_id,
  number: d.order_number,
  storeName: d.store_name ?? "",
  title: d.product_name ?? "",
  createdAt: new Date(d.created_at),
  total: d.total_price,
  quantity: d.qty ?? 0,
  status: d.status,
  canRate: Boolean(d.can_rate),
});

const PROVIDER_LABEL: Record<string, string> = {
  GOPAY: "GoPay",
  SHOPEEPAY: "ShopeePay",
  QRIS: "QRIS",
  BANK_TRANSFER: "Transfer bank (VA)",
  ECHANNEL: "Transfer bank (VA)",
  CREDIT_CARD: "Kartu kredit/debit",
  CSTORE: "Gerai (Indomaret/Alfamart)",
};

export function paymentLabel(method: string, provider: string | null): string {
  if (provider) return PROVIDER_LABEL[provider.toUpperCase()] ?? provider;
  if (method === "COD") return "Bayar di tempat (COD)";
  if (method === "QRIS") return "QRIS";
  return "Bayar online";
}

const toLine = (d: Json): OrderLine => ({
  productId: d.product_id,
  optionId: d.option_id ?? null,
  name: d.product_name,
  optionName: d.option_name ?? null,
  quantity: d.quantity,
  note: d.note ?? "",
  subtotal: d.subtotal,
  unitPrice: d.unit_price,
  bundle: (d.bundle_items ?? []).map((b: Json) => `${b.quantity}× ${b.product_name}${b.option_name ? ` (${b.option_name})` : ""}`),
});

export const toOrderDetail = (d: Json): OrderDetail => ({
  id: d.order_id,
  number: d.order_number,
  status: d.status,
  createdAt: new Date(d.created_at),
  storeName: d.store?.name ?? "",
  storeAddress: d.store?.address ?? "",
  address: d.address ? [d.address.label, d.address.recipient, d.address.address].filter(Boolean).join(" · ") : null,
  items: (d.items ?? []).map(toLine),
  subtotal: d.subtotal,
  deliveryFee: d.delivery_fee,
  deliveryFeeWaived: d.delivery_fee_waived ?? 0,
  freeDeliveryCoupon: Boolean(d.free_delivery_coupon),
  discount: d.discount ?? 0,
  voucherCode: d.voucher_code ?? null,
  total: d.total,
  paymentLabel: paymentLabel(d.payment_method, d.payment_provider ?? null),
  history: (d.status_history ?? []).map((h: Json) => ({ status: h.status, at: new Date(h.at), note: h.note ?? null })),
  canCancel: Boolean(d.can_cancel),
  canRate: Boolean(d.can_rate),
  rating: d.rating?.rating ?? null,
  distanceKm: d.distance_km ?? null,
  eta: eta(d),
  refund: d.refund ? { status: d.refund.status, amount: d.refund.amount ?? 0 } : null,
});

export const toProfile = (d: Json): Profile => ({
  id: d.id,
  name: d.name,
  email: d.email,
  phone: d.phone ?? null,
  emailVerified: d.email_verified !== false,
  hasPassword: d.has_password !== false,
});

export const toAddress = (d: Json): Address => ({
  id: d.id,
  label: d.label,
  recipient: d.recipient,
  phone: d.phone,
  address: d.address,
  notes: d.notes ?? null,
  lat: d.lat ?? null,
  lng: d.lng ?? null,
  isDefault: Boolean(d.is_default),
});

export function toAddressBody(a: Partial<AddressInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (a.label !== undefined) body.label = a.label;
  if (a.recipient !== undefined) body.recipient = a.recipient;
  if (a.phone !== undefined) body.phone = a.phone;
  if (a.address !== undefined) body.address = a.address;
  if (a.notes !== undefined) body.notes = a.notes;
  if (a.lat !== undefined && a.lat !== null) body.lat = a.lat;
  if (a.lng !== undefined && a.lng !== null) body.lng = a.lng;
  if (a.isDefault !== undefined) body.is_default = a.isDefault;
  return body;
}

export const toPaymentMethod = (d: Json): PaymentMethod => ({
  id: d.id,
  type: d.type,
  name: d.name,
  description: d.description ?? null,
  isEnabled: Boolean(d.is_enabled),
  isDefault: Boolean(d.is_default),
});
