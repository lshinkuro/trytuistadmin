import type { AccountRepository, AddressInput } from "@/domain/account/Account";
import type { OrderRepository, QuoteRequest } from "@/domain/order/Order";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

/** Aturan sama dengan backend (POST/PATCH /v1/me/addresses). */
export function validateAddress(a: AddressInput): FieldErrors {
  const e: FieldErrors = {};
  if (!a.label.trim()) e.label = "Wajib diisi";
  if (!a.recipient.trim()) e.recipient = "Wajib diisi";
  if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(a.phone.replace(/[\s-]/g, ""))) e.phone = "Nomor HP tidak valid (mis. 081234567890)";
  if (a.address.trim().length < 10) e.address = "Tulis alamat lengkap (min. 10 karakter)";
  return e;
}

export function makeSaveAddress(repo: AccountRepository) {
  return ({ id, input }: { id: string | null; input: AddressInput }) => {
    const errors = validateAddress(input);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi alamatnya.", errors);
    const clean = { ...input, label: input.label.trim(), recipient: input.recipient.trim(), address: input.address.trim(),
      phone: input.phone.replace(/[\s-]/g, ""), notes: input.notes?.trim() || null };
    return id ? repo.updateAddress(id, clean) : repo.createAddress(clean);
  };
}

export function makeQuote(repo: OrderRepository) {
  return (req: QuoteRequest) => repo.quote(req);
}

/** Keranjang kosong ditolak sebelum ke server. `idempotencyKey` dipakai ulang saat mengulang checkout yang sama. */
export function makeCheckout(repo: OrderRepository) {
  return ({ req, idempotencyKey }: { req: QuoteRequest & { paymentMethodId: string | null }; idempotencyKey: string }) => {
    if (req.items.length === 0) throw new ValidationError("Keranjang masih kosong.");
    return repo.checkout(req, idempotencyKey);
  };
}

export function makeRateOrder(repo: OrderRepository) {
  return ({ id, rating, comment }: { id: string; rating: number; comment: string }) => {
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new ValidationError("Pilih 1–5 bintang dulu ya.");
    return repo.rate(id, rating, comment.trim().slice(0, 500));
  };
}
