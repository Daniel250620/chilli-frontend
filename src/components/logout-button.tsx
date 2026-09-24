"use client";

import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/session";

export function LogoutButton({ user }: { user: SessionUser }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        title={user.email}
        className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-extrabold tracking-wider text-white/80 uppercase transition duration-150 hover:border-mostaza hover:text-mostaza"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
