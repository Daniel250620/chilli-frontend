import axios from "axios";
import { getSession } from "@/lib/session";

// Server-only: never import this from a Client Component. Calls to
// chilli-backend go through here so the browser never talks to it directly.
export const httpClient = axios.create({
  baseURL: process.env.BACKEND_URL,
});

// Spread into a single call's `headers` — never assign to
// httpClient.defaults.headers, which is shared across requests from
// different users' sessions.
export async function authHeaders(): Promise<{ Authorization: string } | undefined> {
  const session = await getSession();
  if (!session) return undefined;
  return { Authorization: `Bearer ${session.token}` };
}
