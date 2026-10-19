import type { CategoryInput, CategoryRepository } from "@/domain/category/Category";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

/** Aturan sama dengan backend (POST/PATCH /v1/admin/categories). */
export function validateCategory(input: Partial<CategoryInput>): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name !== undefined && !input.name.trim()) errors.name = "Nama kategori wajib diisi";
  if (input.name !== undefined && input.name.trim().length > 50) errors.name = "Maksimal 50 karakter";
  return errors;
}

export function makeListAdminCategories(repo: CategoryRepository) {
  return () => repo.list();
}

export function makeSaveCategory(repo: CategoryRepository) {
  return ({ id, input }: { id?: string; input: Partial<CategoryInput> }) => {
    const errors = validateCategory(id ? input : { name: "", ...input });
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data kategori.", errors);
    const clean = { ...input, ...(input.name !== undefined ? { name: input.name.trim() } : {}) };
    return id ? repo.update(id, clean) : repo.create(clean as CategoryInput);
  };
}
