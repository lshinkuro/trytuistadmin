import { describe, expect, it, vi } from "vitest";
import type { OrderRepository } from "@/domain/order/Order";
import { ValidationError } from "@/domain/shared/errors";
import { makeCheckout, makeRateOrder, validateAddress } from "./shopUseCases";

const address = { label: "Rumah", recipient: "Kholis", phone: "0812-3456-7890", address: "Jl. Kebayoran Lama No. 1", notes: null, lat: null, lng: null, isDefault: true };

describe("use case toko", () => {
  it("alamat valid lolos; nomor HP salah ditolak", () => {
    expect(validateAddress(address)).toEqual({});
    expect(validateAddress({ ...address, phone: "12345" }).phone).toBeDefined();
  });

  it("checkout keranjang kosong ditolak sebelum ke server", () => {
    const repo = { checkout: vi.fn() } as unknown as OrderRepository;
    const req = { storeId: "ST01", addressId: null, useFreeDelivery: false, paymentMethodId: "COD", items: [] };
    expect(() => makeCheckout(repo)({ req, idempotencyKey: "k" })).toThrow(ValidationError);
    expect(repo.checkout).not.toHaveBeenCalled();
  });

  it("rating harus 1–5", () => {
    const repo = { rate: vi.fn() } as unknown as OrderRepository;
    expect(() => makeRateOrder(repo)({ id: "o", rating: 0, comment: "" })).toThrow(ValidationError);
  });
});
