import type { Customer, OrderStatus } from "@/domain/order/Order";
import type { DateRange } from "@/domain/shared/dateRange";
import type { Paginated } from "@/domain/shared/pagination";

// Pembayaran online Midtrans (API_PLAN.md §5.27). Pesanan baru dibuat setelah lunas.

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "EXPIRED", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Menunggu bayar",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
};

/** NULL di backend = belum ada refund. REQUIRED = jumlah tidak cocok, perlu dikembalikan manual. */
export type RefundStatus = "REFUND" | "PARTIAL_REFUND" | "CHARGEBACK" | "PARTIAL_CHARGEBACK" | "REVERSED" | "REQUIRED";

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  REFUND: "Direfund penuh",
  PARTIAL_REFUND: "Direfund sebagian",
  CHARGEBACK: "Chargeback",
  PARTIAL_CHARGEBACK: "Chargeback sebagian",
  REVERSED: "Dibatalkan bank",
  REQUIRED: "Perlu refund",
};

/** payment_type Midtrans → label. Yang tidak dikenal ditampilkan apa adanya. */
export const PAYMENT_TYPE_LABEL: Record<string, string> = {
  gopay: "GoPay",
  qris: "QRIS",
  shopeepay: "ShopeePay",
  bank_transfer: "Transfer bank (VA)",
  echannel: "Mandiri Bill",
  credit_card: "Kartu kredit/debit",
  cstore: "Gerai (Indomaret/Alfamart)",
  akulaku: "Akulaku",
  kredivo: "Kredivo",
};

export const paymentTypeLabel = (type: string | null) => (type ? (PAYMENT_TYPE_LABEL[type] ?? type) : "Belum dipilih");

export interface PaymentOrderRef {
  id: string;
  orderNumber: string;
  status: OrderStatus;
}

export interface PaymentSummary {
  id: string;
  providerOrderId: string;
  status: PaymentStatus;
  amount: number;
  refundedAmount: number;
  refundStatus: RefundStatus | null;
  paymentType: string | null;
  storeName: string;
  customer: Customer;
  order: PaymentOrderRef | null;
  createdAt: Date;
  paidAt: Date | null;
  expiresAt: Date;
}

export interface RefundRecord {
  id: string;
  amount: number;
  reason: string;
  method: "MIDTRANS" | "MANUAL";
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  message: string | null;
  adminName: string | null;
  createdAt: Date;
}

export interface PaymentEvent {
  source: string;
  providerStatus: string | null;
  signatureOk: boolean | null;
  payload: unknown;
  createdAt: Date;
}

export interface PaymentDetail extends PaymentSummary {
  providerTxnId: string | null;
  statusMessage: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  items: { productName: string; optionName: string | null; quantity: number; subtotal: number }[];
  /** Sisa yang masih bisa direfund (0 bila belum lunas). */
  refundableAmount: number;
  /** false → channel tidak bisa direfund lewat Midtrans (VA / gerai), hanya catat refund manual. */
  canRefundOnline: boolean;
  refunds: RefundRecord[];
  events: PaymentEvent[];
}

export interface PaymentFilter {
  statuses: PaymentStatus[];
  query: string;
  range: DateRange | null;
  storeId: string;
  /** true = hanya yang punya status refund. */
  refundOnly: boolean;
  page: number;
  limit: number;
}

export interface RefundInput {
  paymentId: string;
  /** null = seluruh sisa. */
  amount: number | null;
  reason: string;
  manual: boolean;
}

export const REFUND_REASON_MAX = 300;

export interface PaymentRepository {
  list(filter: PaymentFilter): Promise<Paginated<PaymentSummary>>;
  get(id: string): Promise<PaymentDetail>;
  refund(input: RefundInput): Promise<PaymentDetail>;
}
