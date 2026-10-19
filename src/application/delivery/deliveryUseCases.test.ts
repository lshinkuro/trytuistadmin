import { describe, expect, it, vi } from "vitest";
import type { DeliveryRepository, DeliverySettings } from "@/domain/delivery/DeliverySettings";
import { ValidationError } from "@/domain/shared/errors";
import { makePreviewDeliverySettings, makeSaveDeliverySettings } from "./deliveryUseCases";

const valid: DeliverySettings = {
  deliveryFee: 10000, deliveryBaseKm: 3, deliveryFeePerKm: 2000, deliveryFeeMax: 30000, freeDeliveryMinSubtotal: 0, prepMinutes: 15, courierSpeedKmh: 20,
  freeDeliveryCouponEnabled: true, freeDeliveryCouponWeekly: 2,
};

function fakeRepo(): DeliveryRepository {
  return { get: vi.fn(), preview: vi.fn(async () => ({}) as never), save: vi.fn(async () => ({}) as never) };
}

describe("deliverySettings", () => {
  it("maks. ongkir di bawah tarif dasar ditolak sebelum ke server", () => {
    const repo = fakeRepo();
    expect(() => makeSaveDeliverySettings(repo)({ ...valid, deliveryFeeMax: 5000 })).toThrow(ValidationError);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it("kecepatan kurir 0 & angka pecahan rupiah ditolak", () => {
    const save = makeSaveDeliverySettings(fakeRepo());
    expect(() => save({ ...valid, courierSpeedKmh: 0 })).toThrow(ValidationError);
    expect(() => save({ ...valid, deliveryFeePerKm: 1500.5 })).toThrow(ValidationError);
  });

  it("kuota kupon mingguan 1–14", () => {
    const save = makeSaveDeliverySettings(fakeRepo());
    expect(() => save({ ...valid, freeDeliveryCouponWeekly: 0 })).toThrow(ValidationError);
    expect(() => save({ ...valid, freeDeliveryCouponWeekly: 15 })).toThrow(ValidationError);
  });

  it("maks. 0 (tanpa batas) & ongkir flat valid", async () => {
    const repo = fakeRepo();
    await makeSaveDeliverySettings(repo)({ ...valid, deliveryFeeMax: 0, deliveryFeePerKm: 0 });
    expect(repo.save).toHaveBeenCalled();
  });

  it("pratinjau draf tidak valid tidak memanggil server", async () => {
    const repo = fakeRepo();
    expect(await makePreviewDeliverySettings(repo)({ settings: { ...valid, deliveryBaseKm: Number.NaN }, subtotal: 0, distances: [] })).toBeNull();
    expect(repo.preview).not.toHaveBeenCalled();
  });
});
