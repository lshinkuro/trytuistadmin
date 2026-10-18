import { describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/domain/shared/errors";
import { storeStatus, type StoreRepository } from "@/domain/store/Store";
import { makeSaveStore, validateStore } from "./storeUseCases";

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

  it("outlet baru wajib nama, alamat, koordinat", () => {
    const repo = { create: vi.fn(), update: vi.fn() } as unknown as StoreRepository;
    expect(() => makeSaveStore(repo)({ input: { name: "Tebet" } })).toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });
});
