import { REFUND_REASON_MAX, type PaymentFilter, type PaymentRepository, type RefundInput } from "@/domain/payment/Payment";
import { validateDateRange } from "@/domain/shared/dateRange";
import { ValidationError } from "@/domain/shared/errors";

export function makeListPayments(repo: PaymentRepository) {
  return (filter: PaymentFilter) => {
    if (filter.range) {
      const error = validateDateRange(filter.range);
      if (error) throw new ValidationError(error, { range: error });
    }
    return repo.list({ ...filter, query: filter.query.trim() });
  };
}

export function makeGetPayment(repo: PaymentRepository) {
  return (id: string) => repo.get(id);
}

/** Refund penuh / sebagian. `refundable` = sisa dari detail pembayaran (backend tetap memeriksa ulang). */
export function makeRefundPayment(repo: PaymentRepository) {
  return (input: RefundInput, refundable: number) => {
    const reason = input.reason.trim();
    if (reason === "") throw new ValidationError("Tulis alasan refund.", { reason: "Alasan wajib diisi" });
    if (reason.length > REFUND_REASON_MAX) {
      throw new ValidationError("Alasan terlalu panjang.", { reason: `Maksimal ${REFUND_REASON_MAX} karakter` });
    }
    if (input.amount !== null && (!Number.isInteger(input.amount) || input.amount < 1 || input.amount > refundable)) {
      throw new ValidationError("Jumlah refund tidak valid.", { amount: "Isi 1 sampai sisa yang bisa direfund" });
    }
    return repo.refund({ ...input, reason });
  };
}
