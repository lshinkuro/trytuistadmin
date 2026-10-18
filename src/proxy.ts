import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: `proxy.ts` (dulu `middleware.ts`). Hanya cek ada/tidaknya cookie sesi;
// keabsahan token & role admin dicek backend pada setiap request lewat /api/backend.
const REFRESH_COOKIE = "tt_admin_refresh";
const ACCESS_COOKIE = "tt_admin_access";

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = req.cookies.has(REFRESH_COOKIE) || req.cookies.has(ACCESS_COOKIE);
  const isLogin = pathname === "/login";

  if (!hasSession && !isLogin) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasSession && isLogin) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"],
};
