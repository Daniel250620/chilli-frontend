"use client";

import { logout } from "@/lib/actions/auth";
import type { SessionUser } from "@/lib/session";

export function LogoutButton({ user }: { user: SessionUser }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        title={user.email}
        className="w-full rounded-xl border-2 border-black bg-guajillo px-3 py-2 text-xs font-extrabold tracking-wider text-white uppercase shadow-[3px_3px_0_0_rgba(255,187,30,0.9)] transition duration-150 hover:bg-guajillo-oscuro active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0_0_rgba(255,187,30,0.9)]"
      >
        Cerrar sesión
      </button>
    </form>
  );
}
