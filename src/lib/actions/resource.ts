"use server";

import { revalidatePath } from "next/cache";
import { httpClient, authHeaders } from "@/lib/http-client";
import { getSession } from "@/lib/session";
import { RESOURCES, type Resource, type Field, errorMessage } from "@/lib/resources";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ponytail: lista fija de recursos con autor; mover a config si aparece otro.
const RESOURCES_WITH_AUTHOR: readonly Resource[] = ["ticket", "invoice", "case"];

export interface ActionState {
  error?: string;
}

function convertValue(field: Field, formData: FormData): unknown {
  if (field.type === "checkbox") return formData.has(field.name);

  const raw = formData.get(field.name);
  const value = typeof raw === "string" ? raw : "";
  if (value === "") return undefined;

  switch (field.type) {
    case "number":
      return Number(value);
    case "json":
      return JSON.parse(value);
    case "datetime":
      return new Date(value).toISOString();
    default:
      return value;
  }
}

export async function saveRecord(
  resource: Resource,
  id: string | null,
  fields: readonly Field[],
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!RESOURCES.includes(resource)) return { error: "Recurso inválido" };
  if (id !== null && !UUID_RE.test(id)) return { error: "Id inválido" };

  const body: Record<string, unknown> = {};
  for (const field of fields) {
    let value: unknown;
    try {
      value = convertValue(field, formData);
    } catch {
      return { error: `${field.label}: JSON inválido` };
    }
    if (value !== undefined) body[field.name] = value;
  }

  if (!id && RESOURCES_WITH_AUTHOR.includes(resource)) {
    const session = await getSession();
    if (!session) return { error: "Sesión inválida" };
    body.createdByUserId = session.user.id;
  }

  try {
    const headers = await authHeaders();
    if (id) {
      await httpClient.patch(`/${resource}/${id}`, body, { headers });
    } else {
      await httpClient.post(`/${resource}/save`, body, { headers });
    }
  } catch (error) {
    return { error: errorMessage(error, "No se pudo guardar el registro") };
  }

  revalidatePath(`/${resource}`);
  return {};
}

export async function deleteRecord(
  resource: Resource,
  id: string,
  _prevState: ActionState,
): Promise<ActionState> {
  if (!RESOURCES.includes(resource)) return { error: "Recurso inválido" };
  if (!UUID_RE.test(id)) return { error: "Id inválido" };

  try {
    const headers = await authHeaders();
    await httpClient.delete(`/${resource}/${id}`, { headers });
  } catch (error) {
    return { error: errorMessage(error, "No se pudo borrar el registro") };
  }

  revalidatePath(`/${resource}`);
  return {};
}
