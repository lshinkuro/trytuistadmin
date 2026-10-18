import type { OrderStatus, PaymentMethod } from "@/domain/order/Order";
import type { DateRange } from "@/domain/shared/dateRange";

/** Penjualan = pesanan berstatus Sukses (COMPLETED) yang dibuat dalam rentang. */
export interface SalesSummary {
  revenue: number;
  ordersCompleted: number;
  averageOrderValue: number;
  itemsSold: number;
  discountTotal: number;
  deliveryFeeTotal: number;
  revenueChangePct: number | null;
}

/** Pembelian = semua transaksi pelanggan dalam rentang, apa pun statusnya. */
export interface PurchaseSummary {
  orders: number;
  buyers: number;
  newBuyers: number;
  repeatBuyers: number;
  inProgress: number;
  failed: number;
  cancelled: number;
  successRatePct: number;
  grossValue: number;
  ordersChangePct: number | null;
}

export interface DailyPoint {
  date: string;
  revenue: number;
  orders: number;
  ordersCompleted: number;
}

export interface Dashboard {
  range: DateRange;
  sales: SalesSummary;
  purchases: PurchaseSummary;
  daily: DailyPoint[];
  byStatus: { status: OrderStatus; count: number; total: number }[];
  topProducts: { productId: string; productName: string; quantity: number; revenue: number }[];
  paymentMethods: { method: PaymentMethod; count: number; total: number }[];
}

export interface DashboardRepository {
  get(range: DateRange): Promise<Dashboard>;
}
