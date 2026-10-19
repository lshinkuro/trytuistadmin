import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import { storeStatus, type StoreRepository } from "@/domain/store/Store";
import { makeSaveStore, makeSetStoreProduct, validateStore, validateStoreProduct } from "./storeUseCases";

describe("store", () => {
  it("status outlet untuk pelanggan", () => {
    expect(storeStatus({ isActive: true, isTemporarilyClosed: false, isOpenNow: true })).toBe("OPEN");
    expect(storeStatus({ isActive: true, isTemporarilyClosed: false, isOpenNow: false })).toBe("OUTSIDE_HOURS");
    expect(storeStatus({ isActive: true, isTemporarilyClosed: true, isOpenNow: false })).toBe("TEMP_CLOSED");
    expect(storeStatus({ isActive: false, isTemporarilyClosed: false, isOpenNow: false })).toBe("INACTIVE");
  });

  it("validasi jam, jangkauan, koordinat", () => {
    const e = validateStore({ opensAt: "25:00", closesAt: "8:00", deliveryRadiusKm: 0, lat: 100 });
    expect(Object.keys(e).sort()).toEqual(["closesAt", "deliveryRadiusKm", "lat", "opensAt"]);
    expect(validateStore({ opensAt: "08:00", closesAt: "22:00", deliveryRadiusKm: 5 })).toEqual({});
  });

  it("stok & harga outlet: kosong boleh (tidak dihitung / harga pusat), negatif & pecahan ditolak", () => {
    const base = { isListed: true, isSoldOut: false, stock: null, price: null };
    expect(validateStoreProduct(base)).toEqual({});
    expect(validateStoreProduct({ ...base, stock: 0, price: 18000 })).toEqual({});
    expect(Object.keys(validateStoreProduct({ ...base, stock: -1, price: 0 })).sort()).toEqual(["price", "stock"]);
    expect(Object.keys(validateStoreProduct({ ...base, stock: 1.5 }))).toEqual(["stock"]);
    const repo = { setStoreProduct: vi.fn() } as unknown as StoreRepository;
    expect(() => makeSetStoreProduct(repo)({ storeId: "ST02", productId: "P01", input: { ...base, stock: -1 } })).toThrow(ValidationError);
    expect(repo.setStoreProduct).not.toHaveBeenCalled();
  });

  it("outlet baru wajib nama, alamat, koordinat", () => {
    const repo = { create: vi.fn(), update: vi.fn() } as unknown as StoreRepository;
    expect(() => makeSaveStore(repo)({ input: { name: "Tebet" } })).toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
