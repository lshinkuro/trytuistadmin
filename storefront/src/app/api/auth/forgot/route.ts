import { NextResponse, type NextRequest } from "next/server";
import { callBackend } from "@/infrastructure/server/backend";
import { clientIp, isSameOrigin } from "@/infrastructure/server/origin";

// Lupa password: backend selalu 200 (tidak membocorkan apakah email terdaftar).
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ code: 403, message: "Origin tidak diizinkan." }, { status: 403 });
  const input = (await req.json().catch(() => null)) as { email?: string } | null;
  const result = await callBackend("/v1/auth/password/forgot", { method: "POST", clientIp: clientIp(req), body: { email: input?.email ?? "" } });
  return NextResponse.json(result.body, { status: result.status });
}
