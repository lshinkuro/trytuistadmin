import "server-only";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/shared/config/env";

/** CSRF: request yang mengubah data harus dari storefront sendiri (cookie SameSite=Lax + cek Origin). */
// Origin dibandingkan dengan Host yang dipakai membuka halaman (bukan req.nextUrl, yang di dev
// selalu localhost), jadi akses dari HP lewat IP Wi-Fi tetap jalan sementara situs lain ditolak.
export function isSameOrigin(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  if (origin === null || origin === serverEnv.publicUrl) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/** IP pembeli dari proxy di depan storefront (entri terakhir X-Forwarded-For, sama dengan aturan backend). */
export function clientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  const last = xff?.split(",").pop()?.trim();
  return last || req.headers.get("x-real-ip")?.trim() || undefined;
}
