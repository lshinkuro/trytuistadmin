import { NextResponse, type NextRequest } from "next/server";
import { callBackend, sessionFrom } from "@/infrastructure/server/backend";
import { clientIp, isSameOrigin } from "@/infrastructure/server/origin";
import { setSessionCookies } from "@/infrastructure/server/session";

// Reset password dengan kode → backend memberi sesi baru; token disimpan di cookie, tidak dikirim ke browser.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ code: 403, message: "Origin tidak diizinkan." }, { status: 403 });
  const input = (await req.json().catch(() => null)) as { email?: string; code?: string; new_password?: string } | null;
  const result = await callBackend("/v1/auth/password/reset", {
    method: "POST",
    clientIp: clientIp(req),
    body: { email: input?.email ?? "", code: input?.code ?? "", new_password: input?.new_password ?? "" },
  });
  const session = sessionFrom(result);
  if (!session) return NextResponse.json(result.body, { status: result.status });
  const res = NextResponse.json({ code: 200, message: "Password diperbarui", data: { name: session.user_name } });
  setSessionCookies(res, session);
  return res;
}
