import "server-only";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/shared/config/env";

/** CSRF: request yang mengubah data harus dari storefront sendiri (cookie SameSite=Lax + cek Origin). */
export function isSameOrigin(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  return origin === null || origin === serverEnv.publicUrl || origin === req.nextUrl.origin;
}

/** IP pembeli dari proxy di depan storefront (entri terakhir X-Forwarded-For, sama dengan aturan backend). */
export function clientIp(req: NextRequest): string | undefined {
  const xff = req.headers.get("x-forwarded-for");
  const last = xff?.split(",").pop()?.trim();
  return last || req.headers.get("x-real-ip")?.trim() || undefined;
}
