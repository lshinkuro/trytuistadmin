import "server-only";

/** Env khusus server (tanpa prefix NEXT_PUBLIC_, jadi tidak ikut ke bundle browser). */
export const serverEnv = {
  apiUrl: (process.env.TRYTUIST_API_URL ?? "http://localhost:8080").replace(/\/+$/, ""),
  apiKey: process.env.TRYTUIST_API_KEY ?? "",
  publicUrl: (process.env.STOREFRONT_PUBLIC_URL ?? "http://localhost:3001").replace(/\/+$/, ""),
  isProduction: process.env.NODE_ENV === "production",
  cookieSecure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
};
