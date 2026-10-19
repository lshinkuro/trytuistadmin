import { NextResponse, type NextRequest } from "next/server";
import { callBackend, refreshSession, sessionFrom } from "@/infrastructure/server/backend";
import { clientIp, isSameOrigin } from "@/infrastructure/server/origin";
import { ACCESS_COOKIE, REFRESH_COOKIE, setSessionCookies } from "@/infrastructure/server/session";

// Ganti password: backend mencabut semua sesi & memberi sesi baru → cookie diganti di sini.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ code: 403, message: "Origin tidak diizinkan." }, { status: 403 });
  const input = (await req.json().catch(() => null)) as { current_password?: string; new_password?: string } | null;
  const ip = clientIp(req);
  let accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!accessToken && refreshToken) accessToken = (await refreshSession(refreshToken, ip))?.access_token;
  if (!accessToken) {
    return NextResponse.json({ code: 401, message: "Silakan masuk lagi.", error: { type: "UNAUTHORIZED" } }, { status: 401 });
  }
  const result = await callBackend("/v1/me/password", {
    method: "POST",
    accessToken,
    clientIp: ip,
    body: { current_password: input?.current_password ?? "", new_password: input?.new_password ?? "" },
  });
  const session = sessionFrom(result);
  if (!session) return NextResponse.json(result.body, { status: result.status });
  const res = NextResponse.json({ code: 200, message: (result.body as { message?: string })?.message ?? "Password diperbarui", data: null });
  setSessionCookies(res, session);
  return res;
}
