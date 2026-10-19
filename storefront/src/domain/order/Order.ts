export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu outlet",
  PAID: "Dibayar",
  PROCESSING: "Disiapkan",
  DELIVERING: "Diantar",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  FAILED: "Gagal",
};

export const statusLabel = (s: string) => ORDER_STATUS_LABEL[s] ?? s;
export const isFinished = (s: string) => s === "COMPLETED" || s === "CANCELLED" || s === "FAILED";

/** Progres pesanan berjalan: Diterima → Disiapkan → Diantar → Selesai (null = batal/gagal). */
export function progressStep(status: string): number | null {
  switch (status) {
    case "PENDING":
    case "PAID":
      return 0;
    case "PROCESSING":
      return 1;
    case "DELIVERING":
      return 2;
    case "COMPLETED":
      return 3;
    default:
      return null;
  }
}

export interface QuoteRequest {
  storeId: string | null;
  addressId: string | null;
  useFreeDelivery: boolean;
  items: { productId: string; optionId: string | null; quantity: number; note: string }[];
}

export interface Quote {
  storeName: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  distanceKm: number | null;
  eta: { min: number; max: number } | null;
  freeDelivery: { enabled: boolean; weeklyQuota: number; remaining: number; applied: boolean; feeWaived: number } | null;
}

export interface OrderLine {
  productId: string;
  optionId: string | null;
  name: string;
  optionName: string | null;
  quantity: number;
  note: string;
  subtotal: number;
  unitPrice: number;
  bundle: string[];
}

export interface OrderSummary {
  id: string;
  number: string;
  storeName: string;
  title: string;
  createdAt: Date;
  total: number;
  quantity: number;
  status: string;
  canRate: boolean;
}

export interface OrderDetail {
  id: string;
  number: string;
  status: string;
  createdAt: Date;
  storeName: string;
  storeAddress: string;
  address: string | null;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  deliveryFeeWaived: number;
  freeDeliveryCoupon: boolean;
  discount: number;
  voucherCode: string | null;
  total: number;
  paymentLabel: string;
  history: { status: string; at: Date; note: string | null }[];
  canCancel: boolean;
  canRate: boolean;
  rating: number | null;
  distanceKm: number | null;
  eta: { min: number; max: number } | null;
  refund: { status: "PENDING" | "PARTIAL" | "COMPLETED"; amount: number } | null;
}

export interface PaymentSession {
  id: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED";
  amount: number;
  expiresAt: Date;
  redirectUrl: string | null;
  statusMessage: string | null;
  orderId: string | null;
}

export type CheckoutResult = { next: "ORDER"; orderId: string } | { next: "PAYMENT"; payment: PaymentSession };

export interface OrderRepository {
  quote(req: QuoteRequest): Promise<Quote>;
  checkout(req: QuoteRequest & { paymentMethodId: string | null }, idempotencyKey: string): Promise<CheckoutResult>;
  payment(id: string): Promise<PaymentSession>;
  cancelPayment(id: string): Promise<PaymentSession>;
  list(page: number): Promise<{ items: OrderSummary[]; total: number }>;
  get(id: string): Promise<OrderDetail>;
  cancel(id: string): Promise<OrderDetail>;
  rate(id: string, rating: number, comment: string): Promise<OrderDetail>;
}
