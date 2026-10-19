import { needsTarget, type BannerInput, type BannerRepository } from "@/domain/banner/Banner";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

/** Aturan sama dengan backend (POST/PATCH /v1/admin/banners). */
export function validateBanner(input: BannerInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.title.trim()) errors.title = "Judul wajib diisi";
  else if (input.title.trim().length > 80) errors.title = "Maksimal 80 karakter";
  if (input.subtitle.trim().length > 120) errors.subtitle = "Maksimal 120 karakter";
  if (!input.imageUrl.trim().startsWith("https://")) errors.imageUrl = "Wajib diisi, diawali https://";
  if (needsTarget(input.actionType) && !input.actionValue) {
    errors.actionValue = input.actionType === "PRODUCT" ? "Pilih menu tujuan" : "Pilih kategori tujuan";
  }
  if (input.startsAt && input.endsAt && input.endsAt <= input.startsAt) errors.endsAt = "Harus setelah waktu mulai";
  if (!Number.isInteger(input.sortOrder) || input.sortOrder < 0 || input.sortOrder > 1000) errors.sortOrder = "0–1000";
  return errors;
}

const clean = (input: BannerInput): BannerInput => ({
  ...input,
  title: input.title.trim(),
  subtitle: input.subtitle.trim(),
  imageUrl: input.imageUrl.trim(),
  actionValue: needsTarget(input.actionType) ? input.actionValue : null,
});

export function makeListBanners(repo: BannerRepository) {
  return () => repo.list();
}

/** `id` null = buat banner baru. */
export function makeSaveBanner(repo: BannerRepository) {
  return ({ id, input }: { id: string | null; input: BannerInput }) => {
    const errors = validateBanner(input);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data banner.", errors);
    return id ? repo.update(id, clean(input)) : repo.create(clean(input));
  };
}

export function makeToggleBanner(repo: BannerRepository) {
  return ({ id, isActive }: { id: string; isActive: boolean }) => repo.update(id, { isActive });
}

export function makeDeleteBanner(repo: BannerRepository) {
  return (id: string) => repo.remove(id);
}
