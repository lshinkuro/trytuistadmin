import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/infrastructure/server/backend";
import { clientIp, isSameOrigin } from "@/infrastructure/server/origin";
import { setSessionCookies, type BackendSession } from "@/infrastructure/server/session";

// Daftar = POST /v1/auth/register (201 + sesi), langsung masuk.
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ code: 403, message: "Origin tidak diizinkan." }, { status: 403 });
  const input = (await req.json().catch(() => null)) as { name?: string; email?: string; password?: string } | null;
  const result = await callBackend("/v1/auth/register", {
    method: "POST",
    clientIp: clientIp(req),
    body: { name: input?.name ?? "", email: input?.email ?? "", password: input?.password ?? "" },
  });
  const session = (result.body as { data?: BackendSession } | null)?.data;
  if (result.status !== 201 || !session?.access_token) return NextResponse.json(result.body, { status: result.status });
  const res = NextResponse.json({ code: 201, message: "Akun dibuat", data: { name: session.user_name } }, { status: 201 });
  setSessionCookies(res, session);
  return res;
}
