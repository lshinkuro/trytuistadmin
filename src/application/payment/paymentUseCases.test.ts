import { describe, expect, it, vi } from "vitest";
import type { PaymentRepository } from "@/domain/payment/Payment";
import { ValidationError } from "@/domain/shared/errors";
import { makeRefundPayment } from "./paymentUseCases";

function fakeRepo(): PaymentRepository {
  return {
    list: vi.fn(async () => ({ items: [], page: 1, limit: 20, total: 0 })),
    get: vi.fn(),
    refund: vi.fn(async () => ({}) as never),
  };
}

describe("refundPayment", () => {
  it("tanpa alasan ditolak sebelum memanggil server", () => {
    const repo = fakeRepo();
    expect(() => makeRefundPayment(repo)({ paymentId: "p1", amount: null, reason: "  ", manual: false }, 54000)).toThrow(
      ValidationError,
    );
    expect(repo.refund).not.toHaveBeenCalled();
  });

  it("jumlah melebihi sisa / bukan bilangan bulat ditolak", () => {
    const refund = makeRefundPayment(fakeRepo());
    expect(() => refund({ paymentId: "p1", amount: 60000, reason: "x", manual: false }, 54000)).toThrow(ValidationError);
    expect(() => refund({ paymentId: "p1", amount: 0, reason: "x", manual: false }, 54000)).toThrow(ValidationError);
    expect(() => refund({ paymentId: "p1", amount: 10.5, reason: "x", manual: false }, 54000)).toThrow(ValidationError);
  });

  it("alasan di-trim; jumlah kosong = seluruh sisa", async () => {
    const repo = fakeRepo();
    await makeRefundPayment(repo)({ paymentId: "p1", amount: null, reason: " Menu habis ", manual: true }, 54000);
    expect(repo.refund).toHaveBeenCalledWith({ paymentId: "p1", amount: null, reason: "Menu habis", manual: true });
  });
});
