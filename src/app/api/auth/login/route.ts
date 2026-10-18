import { NextResponse, type NextRequest } from "next/server";
import { callBackend, sessionFrom } from "@/infrastructure/server/backend";
import { setSessionCookies } from "@/infrastructure/server/session";

// Login memakai POST /v1/auth/login yang sama dengan aplikasi iOS, lalu memastikan
// akunnya admin lewat GET /v1/admin/me sebelum cookie sesi dibuat.
export async function POST(req: NextRequest) {
  const credentials = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  const login = await callBackend("/v1/auth/login", {
    method: "POST",
    body: { email: credentials?.email ?? "", password: credentials?.password ?? "" },
  });
  const session = sessionFrom(login);
  if (!session) return NextResponse.json(login.body, { status: login.status });

  const me = await callBackend("/v1/admin/me", { accessToken: session.access_token });
  if (me.status !== 200) {
    // Bukan admin: cabut refresh token yang baru dibuat supaya tidak tertinggal.
    await callBackend("/v1/auth/logout", {
      method: "POST",
      accessToken: session.access_token,
      body: { refresh_token: session.refresh_token },
    });
    return NextResponse.json(me.body, { status: me.status });
  }
  const res = NextResponse.json(me.body, { status: 200 });
  setSessionCookies(res, session);
  return res;
}
