import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: `proxy.ts`. Halaman yang butuh login diarahkan ke /masuk; katalog bebas dibuka.
// Keabsahan token tetap dicek backend pada setiap request lewat /api/backend.
const REFRESH_COOKIE = "tt_shop_refresh";
const ACCESS_COOKIE = "tt_shop_access";
const PROTECTED = ["/keranjang", "/pesanan", "/akun", "/bayar"];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = req.cookies.has(REFRESH_COOKIE) || req.cookies.has(ACCESS_COOKIE);
  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = new URL("/masuk", req.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasSession && (pathname === "/masuk" || pathname === "/daftar")) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"],
};
