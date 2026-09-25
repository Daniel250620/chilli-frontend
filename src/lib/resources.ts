// No "use server": imported from both Server and Client Components.

import { isAxiosError } from "axios";

export const RESOURCES = [
  "user",
  "customer",
  "ticket",
  "branch",
  "invoice",
  "csf",
  "case",
] as const;

export type Resource = (typeof RESOURCES)[number];

export type Column = { key: string; label: string; sortable?: boolean };

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "checkbox" | "json" | "datetime" | "select" | "autocomplete";
  required?: boolean;
  options?: readonly string[];
  // Ruta (con punto) de donde precargar al editar, cuando difiere de `name`
  // (p.ej. { name: "customerId", from: "customer.id" }).
  from?: string;
  placeholder?: string;
  // Solo para type "autocomplete": recurso a buscar (GET /{resource}/paginate?search=)
  // y qué campos del registro mostrar por opción, p.ej. resource: "customer",
  // displayFields: ["name", "normalizedPhone"].
  resource?: Resource;
  displayFields?: readonly string[];
};

export function errorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && error.response) {
    const message = error.response.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  return fallback;
}

// Lee una ruta con punto ("a.b.c") de un objeto. undefined si no existe.
export function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
    obj,
  );
}
