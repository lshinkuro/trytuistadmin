import { NextResponse, type NextRequest } from "next/server";
import { callBackend, refreshSession } from "@/infrastructure/server/backend";
import { clientIp } from "@/infrastructure/server/origin";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearSessionCookies } from "@/infrastructure/server/session";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  let accessToken = req.cookies.get(ACCESS_COOKIE)?.value;
  if (refreshToken) {
    if (!accessToken) accessToken = (await refreshSession(refreshToken, clientIp(req)))?.access_token;
    if (accessToken) {
      await callBackend("/v1/auth/logout", { method: "POST", accessToken, body: { refresh_token: refreshToken }, clientIp: clientIp(req) });
    }
  }
  const res = NextResponse.json({ code: 200, message: "Berhasil keluar", data: null });
  clearSessionCookies(res);
  return res;
}
