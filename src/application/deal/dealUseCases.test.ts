import { describe, expect, it } from "vitest";
import { discountPercent, type DealInput } from "@/domain/deal/Deal";
import { validateDeal } from "./dealUseCases";

const base: DealInput = {
  productId: "P07",
  title: "Nasi Goreng 19rb",
  subtitle: "",
  badge: "",
  imageUrl: "",
  dealPrice: 19900,
  startsAt: new Date("2026-10-18T00:00:00+07:00"),
  endsAt: new Date("2026-10-25T00:00:00+07:00"),
  isActive: true,
  showAsPopup: true,
  sortOrder: 0,
};

describe("validateDeal", () => {
  it("valid bila lebih murah & periode benar", () => {
    expect(validateDeal(base, 32000)).toEqual({});
  });

  it("harga promo harus di bawah harga normal", () => {
    expect(validateDeal({ ...base, dealPrice: 32000 }, 32000).dealPrice).toBeDefined();
  });

  it("selesai harus setelah mulai, gambar harus https", () => {
    const errors = validateDeal({ ...base, endsAt: base.startsAt, imageUrl: "http://x" }, 32000);
    expect(errors.endsAt).toBeDefined();
    expect(errors.imageUrl).toBeDefined();
  });
});

describe("discountPercent", () => {
  it("dibulatkan ke bawah seperti backend", () => {
    expect(discountPercent(32000, 19900)).toBe(37);
    expect(discountPercent(23000, 15000)).toBe(34);
    expect(discountPercent(10000, 12000)).toBe(0);
  });
});
