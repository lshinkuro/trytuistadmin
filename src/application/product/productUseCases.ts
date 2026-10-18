import {
  MAX_OPTION_EXTRA,
  MAX_OPTIONS,
  MAX_PRICE,
  type ProductFilter,
  type ProductInput,
  type ProductUpdate,
} from "@/domain/product/Product";
import type { ProductRepository } from "@/domain/product/ProductRepository";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

/**
 * Aturan sama dengan backend (POST/PATCH /v1/admin/products). Hanya field yang ada di `input`
 * yang dicek, jadi bisa dipakai untuk tambah (lengkap) maupun ubah (sebagian).
 * Kunci error varian: `options.0.name`, `options.1.extraPrice`, …
 */
export function validateProduct(input: Partial<ProductInput>): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name !== undefined && !input.name.trim()) errors.name = "Nama menu wajib diisi";
  else if (input.name && input.name.trim().length > 100) errors.name = "Maksimal 100 karakter";
  if (input.categoryId !== undefined && !input.categoryId) errors.categoryId = "Pilih kategori";
  if (input.price !== undefined) {
    if (Number.isNaN(input.price)) errors.price = "Harga wajib diisi";
    else if (!Number.isInteger(input.price) || input.price < 0) errors.price = "Harga harus angka bulat ≥ 0";
    else if (input.price > MAX_PRICE) errors.price = "Harga maksimal Rp 10.000.000";
  }
  if (input.description && input.description.length > 500) errors.description = "Maksimal 500 karakter";
  if (input.imageUrl && !input.imageUrl.trim().startsWith("https://")) errors.imageUrl = "Harus diawali https://";
  if (input.options) {
    if (input.options.length > MAX_OPTIONS) errors.options = `Maksimal ${MAX_OPTIONS} varian`;
    const seen = new Set<string>();
    input.options.forEach((o, i) => {
      const name = o.name.trim().toLowerCase();
      if (!name) errors[`options.${i}.name`] = "Nama varian wajib diisi";
      else if (seen.has(name)) errors[`options.${i}.name`] = "Nama varian tidak boleh sama";
      seen.add(name);
      if (!Number.isInteger(o.extraPrice) || o.extraPrice < 0 || o.extraPrice > MAX_OPTION_EXTRA) {
        errors[`options.${i}.extraPrice`] = "Tambahan 0 – Rp 1.000.000";
      }
    });
  }
  return errors;
}

function clean<T extends Partial<ProductInput>>(input: T): T {
  return {
    ...input,
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl.trim() } : {}),
    ...(input.options ? { options: input.options.map((o) => ({ ...o, name: o.name.trim() })) } : {}),
  };
}

export function makeListProducts(repo: ProductRepository) {
  return (filter: ProductFilter) => repo.list({ ...filter, query: filter.query.trim() });
}

export function makeListCategories(repo: ProductRepository) {
  return () => repo.categories();
}

/** Tambah menu baru; langsung tampil di aplikasi (GET /v1/products) bila tersedia. */
export function makeCreateProduct(repo: ProductRepository) {
  return (input: ProductInput) => {
    const errors = validateProduct(input);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data menu.", errors);
    return repo.create(clean(input));
  };
}

export function makeUpdateProduct(repo: ProductRepository) {
  return (update: ProductUpdate) => {
    const errors = validateProduct(update);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data menu.", errors);
    return repo.update(clean(update));
  };
}
