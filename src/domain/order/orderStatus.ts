import type { OrderStatus } from "./Order";

/** Bahasa yang dipakai admin, bukan nama enum. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Dibayar",
  PROCESSING: "Diproses",
  DELIVERING: "Diantar",
  COMPLETED: "Sukses",
  CANCELLED: "Batal",
  FAILED: "Gagal",
};

/** Alur normal pesanan (rel status di dashboard). */
export const ORDER_FLOW: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "DELIVERING", "COMPLETED"];

export const FINAL_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED", "FAILED"];

export const ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "DELIVERING"];

export function isFinal(status: OrderStatus): boolean {
  return FINAL_STATUSES.includes(status);
}

/**
 * Sama dengan `order.CanAdminTransition` di backend: maju sesuai alur (boleh melompat,
 * mis. Menunggu → Sukses), atau Gagal/Batal selama belum selesai. Status akhir terkunci.
 * Server tetap yang memutuskan; ini dipakai untuk UI & validasi awal.
 */
export function canAdminTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (isFinal(from) || from === to) return false;
  if (to === "FAILED" || to === "CANCELLED") return true;
  const fromRank = ORDER_FLOW.indexOf(from);
  const toRank = ORDER_FLOW.indexOf(to);
  return fromRank >= 0 && toRank > fromRank;
}

/** Gagal & batal wajib disertai alasan (dilihat pelanggan di riwayat pesanan). */
export function requiresNote(status: OrderStatus): boolean {
  return status === "FAILED" || status === "CANCELLED";
}

export const STATUS_NOTE_MAX = 300;
