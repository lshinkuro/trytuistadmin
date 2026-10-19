import "server-only";
import { serverEnv } from "@/shared/config/env";
import type { BackendSession } from "./session";

export interface BackendResult {
  status: number;
  body: unknown;
}

interface CallOptions {
  method?: string;
  body?: unknown;
  rawBody?: string;
  accessToken?: string;
  search?: string;
  /** Header tambahan (mis. Idempotency-Key checkout). */
  headers?: Record<string, string>;
}

/** Satu-satunya tempat yang memanggil backend Go (dengan API key). */
export async function callBackend(path: string, opts: CallOptions = {}): Promise<BackendResult> {
  const headers: Record<string, string> = { ...opts.headers, Accept: "application/json", "X-API-Key": serverEnv.apiKey };
  if (opts.accessToken) headers.Authorization = `Bearer ${opts.accessToken}`;
  const payload = opts.rawBody ?? (opts.body === undefined ? undefined : JSON.stringify(opts.body));
  if (payload !== undefined) headers["Content-Type"] = "application/json";
  try {
    const res = await fetch(`${serverEnv.apiUrl}${path}${opts.search ?? ""}`, {
      method: opts.method ?? "GET",
      headers,
      body: payload,
      cache: "no-store",
    });
    const body = await res.json().catch(() => null);
    return { status: res.status, body };
  } catch {
    return {
      status: 502,
      body: {
        code: 502,
        message: "Server TryTuist tidak bisa dihubungi. Pastikan trytuist-api berjalan.",
        error: { type: "BACKEND_UNREACHABLE" },
      },
    };
  }
}

export function sessionFrom(result: BackendResult): BackendSession | null {
  const data = (result.body as { data?: BackendSession } | null)?.data;
  return result.status === 200 && data?.access_token && data.refresh_token ? data : null;
}

// Refresh token dirotasi backend: dua request paralel dengan refresh token yang sama akan
// membuat yang kedua gagal. Hasil refresh dibagi sebentar untuk request yang datang bersamaan.
const inflight = new Map<string, { promise: Promise<BackendSession | null>; at: number }>();
const SHARE_MS = 10_000;

export function refreshSession(refreshToken: string): Promise<BackendSession | null> {
  const now = Date.now();
  for (const [key, entry] of inflight) if (now - entry.at > SHARE_MS) inflight.delete(key);
  const existing = inflight.get(refreshToken);
  if (existing) return existing.promise;
  const promise = callBackend("/v1/auth/refresh", { method: "POST", body: { refresh_token: refreshToken } }).then(
    sessionFrom,
  );
  inflight.set(refreshToken, { promise, at: now });
  return promise;
}
