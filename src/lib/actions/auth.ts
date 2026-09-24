"use server";

import { redirect } from "next/navigation";
import { httpClient } from "@/lib/http-client";
import { clearSession, setSession } from "@/lib/session";
import { errorMessage } from "@/lib/resources";

const DEFAULT_POST_LOGIN_ROUTE = "/";

export interface LoginState {
  error?: string;
}

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    const { data } = await httpClient.post("/auth/login", { email, password });
    await setSession({
      token: data.token,
      user: data.user,
      rol: data.user?.rol ?? null,
      accessList: data.accessList ?? [],
    });
  } catch (error) {
    return { error: errorMessage(error, "No se pudo iniciar sesión") };
  }

  redirect(DEFAULT_POST_LOGIN_ROUTE);
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
