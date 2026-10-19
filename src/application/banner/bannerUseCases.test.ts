import { describe, expect, it, vi } from "vitest";
import type { BannerInput, BannerRepository } from "@/domain/banner/Banner";
import { ValidationError } from "@/domain/shared/errors";
import { makeSaveBanner } from "./bannerUseCases";

const valid: BannerInput = {
  title: "Paket Combo Hemat",
  subtitle: "",
  imageUrl: "https://images.unsplash.com/x",
  actionType: "CATEGORY",
  actionValue: "combo",
  startsAt: null,
  endsAt: null,
  sortOrder: 0,
  isActive: true,
};

function fakeRepo(): BannerRepository {
  return { list: vi.fn(), create: vi.fn(async () => ({}) as never), update: vi.fn(async () => ({}) as never), remove: vi.fn() };
}

describe("saveBanner", () => {
  it("aksi menu/kategori tanpa tujuan ditolak sebelum ke server", () => {
    const repo = fakeRepo();
    expect(() => makeSaveBanner(repo)({ id: null, input: { ...valid, actionValue: null } })).toThrow(ValidationError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("gambar harus https & periode harus berurutan", () => {
    const save = makeSaveBanner(fakeRepo());
    expect(() => save({ id: null, input: { ...valid, imageUrl: "http://x" } })).toThrow(ValidationError);
    const start = new Date("2026-10-20T08:00:00+07:00");
    expect(() => save({ id: null, input: { ...valid, startsAt: start, endsAt: start } })).toThrow(ValidationError);
  });

  it("aksi kupon membuang nilai tujuan lama", async () => {
    const repo = fakeRepo();
    await makeSaveBanner(repo)({ id: "B2", input: { ...valid, actionType: "FREE_DELIVERY", actionValue: "combo" } });
    expect(repo.update).toHaveBeenCalledWith("B2", expect.objectContaining({ actionType: "FREE_DELIVERY", actionValue: null }));
  });
});
