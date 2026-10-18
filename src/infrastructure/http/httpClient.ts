import { AppError, type FieldErrors } from "@/domain/shared/errors";

/** Envelope backend (API_PLAN.md §3.2–3.3). */
interface Envelope<T> {
  code: number;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number };
  error?: { type: string; details?: { field: string; message: string }[] };
}

export interface HttpResult<T> {
  data: T;
  meta?: Envelope<T>["meta"];
  message: string;
}

type Query = Record<string, string | number | boolean | undefined | null>;

export interface HttpClient {
  get<T>(path: string, query?: Query): Promise<HttpResult<T>>;
  post<T>(path: string, body?: unknown): Promise<HttpResult<T>>;
  patch<T>(path: string, body?: unknown): Promise<HttpResult<T>>;
  put<T>(path: string, body?: unknown): Promise<HttpResult<T>>;
  delete<T>(path: string): Promise<HttpResult<T>>;
}

/**
 * Nama field backend → kunci error di form: snake_case → camelCase, indeks array → titik.
 * `deal_price` → `dealPrice`, `options[1].extra_price` → `options.1.extraPrice`,
 * `product_name` → `name` (nama field entity Product).
 */
const FIELD_ALIASES: Record<string, string> = { productName: "name" };

export function camel(field: string): string {
  const key = field.replace(/\[(\d+)\]/g, ".$1").replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  return FIELD_ALIASES[key] ?? key;
}

export function toAppError(status: number, body: Partial<Envelope<unknown>> | null): AppError {
  const fieldErrors: FieldErrors = {};
  for (const d of body?.error?.details ?? []) fieldErrors[camel(d.field)] = d.message;
  const message =
    body?.message ??
    (status === 0 ? "Tidak bisa terhubung ke server. Periksa koneksi lalu coba lagi." : `Permintaan gagal (${status}).`);
  return new AppError(message, body?.error?.type ?? (status === 0 ? "NETWORK_ERROR" : "UNKNOWN"), status, fieldErrors);
}

/**
 * Client untuk browser. Semua request lewat BFF Next.js (`/api/backend/*`) yang menambahkan
 * API key & token dari cookie httpOnly, jadi tidak ada rahasia di sini.
 */
export function createHttpClient(baseUrl = "/api/backend", fetcher: typeof fetch = (...a) => fetch(...a)): HttpClient {
  async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<HttpResult<T>> {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    }
    const qs = params.toString();
    let res: Response;
    try {
      res = await fetcher(`${baseUrl}${path}${qs ? `?${qs}` : ""}`, {
        method,
        headers: body === undefined ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
      });
    } catch {
      throw toAppError(0, null);
    }
    const json = (await res.json().catch(() => null)) as Envelope<T> | null;
    if (!res.ok || !json) throw toAppError(res.status, json);
    return { data: json.data, meta: json.meta, message: json.message };
  }

  return {
    get: (path, query) => request("GET", path, undefined, query),
    post: (path, body) => request("POST", path, body ?? {}),
    patch: (path, body) => request("PATCH", path, body ?? {}),
    put: (path, body) => request("PUT", path, body ?? {}),
    delete: (path) => request("DELETE", path),
  };
}
