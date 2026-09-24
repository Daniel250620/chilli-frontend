"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-extrabold tracking-wider text-carbon uppercase">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@fondita.mx"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-extrabold tracking-wider text-carbon uppercase">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>
      {state?.error && (
        <p role="alert" className="rounded-xl border border-guajillo/30 bg-guajillo/10 px-3 py-2 text-sm font-semibold text-guajillo">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-xl border-2 border-black bg-guajillo px-4 py-3 text-sm font-extrabold tracking-wider text-white uppercase shadow-[4px_4px_0_0_#000] transition duration-150 hover:-translate-y-0.5 hover:bg-guajillo-oscuro active:translate-x-1 active:translate-y-1 active:shadow-none disabled:translate-none disabled:shadow-[4px_4px_0_0_#000]"
      >
        {pending ? "Entrando a cocina..." : "Ingresar"}
      </button>
    </form>
  );
}
