import "server-only";
import type { NextRequest } from "next/server";
import { serverEnv } from "@/shared/config/env";

/** CSRF: request yang mengubah data harus dari storefront sendiri (cookie SameSite=Lax + cek Origin). */
export function isSameOrigin(req: NextRequest): boolean {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  return origin === null || origin === serverEnv.publicUrl || origin === req.nextUrl.origin;
}
