import { NextResponse, type NextRequest } from "next/server";
import { isAllowed } from "@/infrastructure/server/allowlist";
import { callBackend, refreshSession } from "@/infrastructure/server/backend";
import { isSameOrigin } from "@/infrastructure/server/origin";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearSessionCookies,
  setSessionCookies,
  type BackendSession,
} from "@/infrastructure/server/session";

// Proxy browser → backend Go untuk endpoint pembeli (allowlist). Menambahkan API key + Bearer
// token dari cookie httpOnly, dan me-refresh access token sekali bila backend membalas 401.

const HEADERS_FORWARDED = ["idempotency-key"];

async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  const path = segments.map(encodeURIComponent).join("/");
  if (!isAllowed(req.method, path)) {
    return NextResponse.json({ code: 404, message: "Endpoint tidak ditemukan.", error: { type: "NOT_FOUND" } }, { status: 404 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ code: 403, message: "Origin tidak diizinkan.", error: { type: "FORBIDDEN" } }, { status: 403 });
  }
  const rawBody = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();
  const extra: Record<string, string> = {};
  for (const h of HEADERS_FORWARDED) {
    const v = req.headers.get(h);
    if (v) extra[h] = v;
  }
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  let accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  let refreshed: BackendSession | null = null;

  if (!accessToken && refreshToken) {
    refreshed = await refreshSession(refreshToken);
    accessToken = refreshed?.access_token;
  }
  const call = (token?: string) =>
    callBackend(`/${path}`, {
      method: req.method,
      rawBody: rawBody || undefined,
      accessToken: token,
      search: req.nextUrl.search,
      headers: extra,
    });

  let result = await call(accessToken);
  if (result.status === 401 && refreshToken && !refreshed) {
    refreshed = await refreshSession(refreshToken);
    if (refreshed) result = await call(refreshed.access_token);
  }

  const res = NextResponse.json(result.body, { status: result.status });
  if (refreshed) setSessionCookies(res, refreshed);
  if (result.status === 401) clearSessionCookies(res);
  return res;
}

export { handle as GET, handle as POST, handle as PATCH, handle as PUT, handle as DELETE };
