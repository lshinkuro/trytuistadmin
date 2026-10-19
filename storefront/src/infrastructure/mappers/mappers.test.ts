import { describe, expect, it } from "vitest";
import { paymentLabel, toBanner, toProduct, toQuoteBody } from "./mappers";

describe("mappers", () => {
  it("combo & harga promo dari ProductDTO", () => {
    const p = toProduct({ product_id: "C01", product_name: "Paket", price: 39000, original_price: null, tags: ["combo"],
      combo: { items: [{ product_name: "Kopi", option_name: "Large", quantity: 1 }], separate_price: 48000, savings: 9000 } });
    expect(p.combo?.savings).toBe(9000);
    expect(p.originalPrice).toBeNull();
    expect(p.isAvailable).toBe(true);
  });

  it("aksi banner tak dikenal = NONE", () => {
    expect(toBanner({ id: "B", title: "x", action: { type: "SOMETHING" } }).action).toEqual({ type: "NONE" });
    expect(toBanner({ id: "B", title: "x", action: { type: "PRODUCT", value: "P07" } }).action).toEqual({ type: "PRODUCT", productId: "P07" });
  });

  it("body quote snake_case tanpa field kosong", () => {
    expect(toQuoteBody({ storeId: null, addressId: "a1", useFreeDelivery: true, items: [{ productId: "P01", optionId: null, quantity: 2, note: "" }] }))
      .toEqual({ address_id: "a1", use_free_delivery: true, items: [{ product_id: "P01", option_id: null, quantity: 2, note: "" }] });
  });

  it("label pembayaran", () => {
    expect(paymentLabel("ONLINE", "gopay")).toBe("GoPay");
    expect(paymentLabel("COD", null)).toBe("Bayar di tempat (COD)");
  });
});
