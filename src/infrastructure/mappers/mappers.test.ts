import { describe, expect, it } from "vitest";
import { camel, toAppError } from "../http/httpClient";
import { toDealBody, toOrderSummary, toPaymentSummary, toProductBody, toStatus } from "./mappers";

describe("mappers", () => {
  it("status tak dikenal tidak membuat UI crash", () => {
    expect(toStatus("FAILED")).toBe("FAILED");
    expect(toStatus("SOMETHING_NEW")).toBe("PENDING");
  });

  it("body promo hanya berisi field yang diubah (snake_case)", () => {
    expect(toDealBody({ isActive: false })).toEqual({ is_active: false });
    expect(toDealBody({ dealPrice: 15000, productId: "P01" })).toEqual({ deal_price: 15000, product_id: "P01" });
  });

  it("error backend → AppError dengan field camelCase", () => {
    const err = toAppError(422, {
      message: "Harga promo harus lebih murah",
      error: { type: "DEAL_PRICE_TOO_HIGH", details: [{ field: "deal_price", message: "harus < Rp 23.000" }] },
    });
    expect(err.type).toBe("DEAL_PRICE_TOO_HIGH");
    expect(err.fieldErrors.dealPrice).toBe("harus < Rp 23.000");
    expect(toAppError(0, null).type).toBe("NETWORK_ERROR");
  });

  it("body menu: varian tanpa id dikirim tanpa id", () => {
    expect(toProductBody({ name: "Es Teh", options: [{ name: "Regular", extraPrice: 0 }, { id: "large", name: "Large", extraPrice: 5000 }] })).toEqual({
      product_name: "Es Teh",
      options: [{ name: "Regular", extra_price: 0 }, { id: "large", name: "Large", extra_price: 5000 }],
    });
  });

  it("field error backend dipetakan ke kunci form", () => {
    expect(camel("options[1].extra_price")).toBe("options.1.extraPrice");
    expect(camel("product_name")).toBe("name");
    expect(camel("deal_price")).toBe("dealPrice");
  });

  it("pesanan Bayar Online tidak tampil sebagai COD", () => {
    const customer = { id: "u1", name: "K", email: "k@x", phone: null };
    const base = { order_id: "o1", order_number: "ORD-1", status: "PAID", total: 54000, item_summary: "", qty: 1, store_id: "ST01", store_name: "G", customer, created_at: "2026-10-19T10:00:00+07:00", updated_at: "2026-10-19T10:00:00+07:00" };
    expect(toOrderSummary({ ...base, payment_method: "ONLINE" }).paymentMethod).toBe("ONLINE");
    expect(toOrderSummary({ ...base, payment_method: "ANEH" }).paymentMethod).toBe("COD");
  });

  it("ringkasan pembayaran: status tak dikenal aman, pesanan opsional", () => {
    const p = toPaymentSummary({
      id: "p1", provider_order_id: "TT-DEV-1", status: "BARU", amount: 54000, refunded_amount: 20000, refund_status: "PARTIAL_REFUND",
      payment_type: "gopay", store_id: "ST01", store_name: "G", customer: { id: "u1", name: "K", email: "k@x", phone: null },
      order: { id: "o1", order_number: "ORD-1", status: "PAID" }, created_at: "2026-10-19T10:00:00+07:00", paid_at: null, expires_at: "2026-10-19T10:15:00+07:00",
    });
    expect(p.status).toBe("PENDING");
    expect(p.order?.orderNumber).toBe("ORD-1");
    expect(p.paidAt).toBeNull();
  });
});
