import { NextResponse, type NextRequest } from "next/server";
import { callBackend, sessionFrom } from "@/infrastructure/server/backend";
import { clientIp, isSameOrigin } from "@/infrastructure/server/origin";
import { setSessionCookies } from "@/infrastructure/server/session";

// Login pembeli: POST /v1/auth/login yang sama dengan app iOS. Token disimpan di cookie httpOnly.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ code: 403, message: "Origin tidak diizinkan." }, { status: 403 });
  const credentials = (await req.json().catch(() => null)) as { email?: string; password?: string } | null;
  const login = await callBackend("/v1/auth/login", {
    method: "POST",
    clientIp: clientIp(req),
    body: { email: credentials?.email ?? "", password: credentials?.password ?? "" },
  });
  const session = sessionFrom(login);
  if (!session) return NextResponse.json(login.body, { status: login.status });
  const res = NextResponse.json({ code: 200, message: "Berhasil masuk", data: { name: session.user_name } });
  setSessionCookies(res, session);
  return res;
}
