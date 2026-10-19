import { ValidationError, type FieldErrors } from "@/domain/shared/errors";
import { MIN_PASSWORD, type StaffInput, type StaffRepository, type StaffUpdate } from "@/domain/staff/Staff";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Aturan sama dengan backend (POST/PATCH /v1/admin/staff). Hanya field yang ada yang dicek. */
export function validateStaff(input: Partial<StaffInput>): FieldErrors {
  const errors: FieldErrors = {};
  if (input.name !== undefined && !input.name.trim()) errors.name = "Nama wajib diisi";
  if (input.email !== undefined && !EMAIL.test(input.email.trim())) errors.email = "Format email belum benar";
  if (input.password !== undefined && input.password.length < MIN_PASSWORD) errors.password = `Minimal ${MIN_PASSWORD} karakter`;
  if (input.role === "OUTLET_ADMIN" && input.storeId !== undefined && !input.storeId) errors.storeId = "Pilih outlet";
  return errors;
}

export function makeListStaff(repo: StaffRepository) {
  return () => repo.list();
}

export function makeCreateStaff(repo: StaffRepository) {
  return (input: StaffInput) => {
    const errors = validateStaff(input);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data akun.", errors);
    return repo.create({ ...input, name: input.name.trim(), email: input.email.trim() });
  };
}

export function makeUpdateStaff(repo: StaffRepository) {
  return ({ id, input }: { id: string; input: StaffUpdate }) => {
    const errors = validateStaff(input);
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi data akun.", errors);
    return repo.update(id, input);
  };
}
