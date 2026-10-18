import type { DealInput } from "@/domain/deal/Deal";
import type { DealRepository } from "@/domain/deal/DealRepository";
import { MAX_PRICE } from "@/domain/product/Product";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

/** `normalPrice` = harga normal produk yang dipilih, untuk memastikan promo memang lebih murah. */
export function validateDeal(input: DealInput, normalPrice: number | null): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.productId) errors.productId = "Pilih produk";
  if (!input.title.trim()) errors.title = "Judul wajib diisi";
  if (!Number.isInteger(input.dealPrice) || input.dealPrice <= 0) errors.dealPrice = "Harga promo wajib diisi";
  else if (input.dealPrice > MAX_PRICE) errors.dealPrice = "Harga maksimal Rp 10.000.000";
  else if (normalPrice !== null && input.dealPrice >= normalPrice) errors.dealPrice = "Harus lebih murah dari harga normal";
  if (Number.isNaN(input.startsAt.getTime())) errors.startsAt = "Tanggal mulai tidak valid";
  if (Number.isNaN(input.endsAt.getTime())) errors.endsAt = "Tanggal selesai tidak valid";
  else if (input.endsAt <= input.startsAt) errors.endsAt = "Harus setelah tanggal mulai";
  if (input.imageUrl && !input.imageUrl.startsWith("https://")) errors.imageUrl = "Harus diawali https://";
  return errors;
}

export function makeListDeals(repo: DealRepository) {
  return () => repo.list();
}

export function makeSaveDeal(repo: DealRepository) {
  return ({ id, input, normalPrice }: { id?: string; input: DealInput; normalPrice: number | null }) => {
    const errors = validateDeal(input, normalPrice);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data promo.", errors);
    const clean = { ...input, title: input.title.trim(), subtitle: input.subtitle.trim(), badge: input.badge.trim() };
    return id ? repo.update(id, clean) : repo.create(clean);
  };
}

export function makeToggleDeal(repo: DealRepository) {
  return ({ id, isActive }: { id: string; isActive: boolean }) => repo.update(id, { isActive });
}

export function makeDeleteDeal(repo: DealRepository) {
  return (id: string) => repo.remove(id);
}
