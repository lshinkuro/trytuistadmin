import type { AuthRepository, Credentials } from "@/domain/auth/Auth";
import { ValidationError, type FieldErrors } from "@/domain/shared/errors";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function makeLogin(repo: AuthRepository) {
  return (credentials: Credentials) => {
    const email = credentials.email.trim().toLowerCase();
    const errors: FieldErrors = {};
    if (!EMAIL.test(email)) errors.email = "Format email tidak valid";
    if (!credentials.password) errors.password = "Password wajib diisi";
    if (Object.keys(errors).length > 0) throw new ValidationError("Periksa lagi email dan password.", errors);
    return repo.login({ email, password: credentials.password });
  };
}

export function makeLogout(repo: AuthRepository) {
  return () => repo.logout();
}

export function makeGetCurrentAdmin(repo: AuthRepository) {
  return () => repo.currentAdmin();
}
