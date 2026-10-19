export type FieldErrors = Record<string, string>;

/**
 * Error yang dimengerti seluruh aplikasi. Infrastructure menerjemahkan error HTTP/backend
 * ke sini; presentation cukup menampilkan `message` dan `fieldErrors`.
 */
export class AppError extends Error {
  constructor(
    message: string,
    readonly type: string = "UNKNOWN",
    readonly status: number = 0,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "AppError";
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }
}

/** Ditolak sebelum memanggil server (validasi di use case). */
export class ValidationError extends AppError {
  constructor(message: string, fieldErrors: FieldErrors = {}) {
    super(message, "VALIDATION_ERROR", 400, fieldErrors);
    this.name = "ValidationError";
  }
}
