import type { DateRange } from "@/domain/shared/dateRange";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentMethod = "COD" | "QRIS" | "EWALLET" | "ONLINE";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  paymentMethod: PaymentMethod;
  itemSummary: string;
  quantity: number;
  storeId: string;
  storeName: string;
  customer: Customer;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderLine {
  productId: string;
  productName: string;
  optionName: string | null;
  unitPrice: number;
  quantity: number;
  note: string;
  subtotal: number;
  /** Isi paket combo, mis. "1× Es Kopi Susu (Large)"; kosong untuk menu biasa. */
  bundle: string[];
}

export interface StatusEvent {
  status: OrderStatus;
  at: Date;
  note: string | null;
  changedBy: string | null;
}

export interface DeliveryAddress {
  label: string;
  recipient: string;
  phone: string;
  address: string;
  notes: string | null;
}

export interface OrderDetail extends Omit<OrderSummary, "itemSummary" | "quantity" | "updatedAt" | "storeId"> {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode: string | null;
  note: string | null;
  paymentProvider: string | null;
  paymentAccountMasked: string | null;
  storeAddress: string;
  address: DeliveryAddress | null;
  items: OrderLine[];
  history: StatusEvent[];
  rating: { rating: number; comment: string | null } | null;
  /** Status yang boleh dipilih admin dari status sekarang (dari server). */
  nextStatuses: OrderStatus[];
  /** Pelanggan memakai kupon gratis ongkir mingguan; `deliveryFeeWaived` = ongkir yang ditanggung toko. */
  freeDeliveryCoupon: boolean;
  deliveryFeeWaived: number;
  /** null = alamat tanpa koordinat / pesanan lama. */
  distanceKm: number | null;
  eta: { minMinutes: number; maxMinutes: number } | null;
  /** Pembayaran online (Midtrans); null untuk COD. */
  payment: {
    id: string;
    providerOrderId: string;
    status: string;
    paymentType: string | null;
    refundStatus: string | null;
    paidAt: Date | null;
  } | null;
}

export interface OrderFilter {
  statuses: OrderStatus[];
  query: string;
  range: DateRange | null;
  /** Kosong = semua outlet. */
  storeId: string;
  page: number;
  limit: number;
}

export interface StatusChange {
  orderId: string;
  status: OrderStatus;
  note: string;
}
