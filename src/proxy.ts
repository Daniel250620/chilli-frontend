import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSession } from "@/lib/session";

const DEFAULT_POST_LOGIN_ROUTE = "/";
const LOGIN_ROUTE = "/login";

// Optimistic check only (no backend round-trip) — pages/actions reading
// sensitive data must still call getSession() themselves. See design.md
// "Riesgo: Proxy solo hace optimistic checks".
export function proxy(request: NextRequest) {
  const session = parseSession(request.cookies.get("session")?.value);
  const isLoginRoute = request.nextUrl.pathname === LOGIN_ROUTE;

  if (!session && !isLoginRoute) {
    return NextResponse.redirect(new URL(LOGIN_ROUTE, request.url));
  }

  if (session && isLoginRoute) {
    return NextResponse.redirect(new URL(DEFAULT_POST_LOGIN_ROUTE, request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
