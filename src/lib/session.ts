import { cookies } from "next/headers";

// Server-only (uses next/headers, throws if imported from a Client Component).

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  name?: string | null;
  email: string;
  rol?: string | null;
  [key: string]: unknown;
}

export interface Session {
  token: string;
  user: SessionUser;
  rol: string | null;
  accessList: string[];
}

export async function setSession(session: Session) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Used by both getSession() (Server Components) and proxy.ts (which reads
// the raw cookie off the request, not via next/headers).
export function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE)?.value);
}
