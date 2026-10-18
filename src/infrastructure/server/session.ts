import "server-only";
import type { NextResponse } from "next/server";
import { serverEnv } from "@/shared/config/env";

export const ACCESS_COOKIE = "tt_admin_access";
export const REFRESH_COOKIE = "tt_admin_refresh";

/** Bentuk `data` dari POST /v1/auth/login & /v1/auth/refresh. */
export interface BackendSession {
  user_name: string;
  access_token: string;
  refresh_token: string;
  /** Unix detik kapan access token habis. */
  expires_at: number;
}

const REFRESH_MAX_AGE = 30 * 24 * 60 * 60; // sama dengan JWT_REFRESH_TTL backend

const base = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: serverEnv.cookieSecure,
  path: "/",
});

export function setSessionCookies(res: NextResponse, session: BackendSession) {
  const accessMaxAge = Math.max(30, session.expires_at - Math.floor(Date.now() / 1000) - 15);
  res.cookies.set(ACCESS_COOKIE, session.access_token, { ...base(), maxAge: accessMaxAge });
  res.cookies.set(REFRESH_COOKIE, session.refresh_token, { ...base(), maxAge: REFRESH_MAX_AGE });
}

export function clearSessionCookies(res: NextResponse) {
  res.cookies.set(ACCESS_COOKIE, "", { ...base(), maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...base(), maxAge: 0 });
}
