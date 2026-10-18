import "server-only";

/** Env khusus server (tidak memakai prefix NEXT_PUBLIC_, jadi tidak ikut ke bundle browser). */
export const serverEnv = {
  apiUrl: (process.env.TRYTUIST_API_URL ?? "http://localhost:8080").replace(/\/+$/, ""),
  apiKey: process.env.TRYTUIST_API_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  /** Cookie `Secure` (default: aktif di production). Set COOKIE_SECURE=false hanya bila diakses lewat http non-localhost. */
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
};
