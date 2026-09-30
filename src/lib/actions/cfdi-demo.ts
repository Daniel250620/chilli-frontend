"use server";

import { httpClient, authHeaders } from "@/lib/http-client";
import { errorMessage } from "@/lib/resources";

export interface StampResult {
  uuid: string;
  serie: string;
  folio: string;
  fechaTimbrado: string;
}

export interface Receptor {
  rfc: string;
  nombre: string;
  cp: string;
  regimen: string;
  uso: string;
}

export interface CsfData {
  rfc: string;
  socialReason: string;
  postalCode: string;
  taxRegimes: string[];
}

export async function stampCfdi(receptor: Receptor): Promise<{ data?: StampResult; error?: string }> {
  try {
    const { data } = await httpClient.post("/cfdi-demo/stamp", receptor, {
      headers: await authHeaders(),
      timeout: 60_000,
    });
    return { data };
  } catch (error) {
    return { error: errorMessage(error, "No se pudo timbrar el CFDI") };
  }
}

// PII: los datos extraídos solo se devuelven al cliente, nunca se registran.
export async function extractCsf(formData: FormData): Promise<{ data?: CsfData; error?: string }> {
  try {
    const { data } = await httpClient.post("/csf/extract", formData, {
      headers: await authHeaders(),
      timeout: 60_000,
    });
    return { data };
  } catch (error) {
    return { error: errorMessage(error, "No se pudo leer la constancia") };
  }
}

export async function extractTicket(formData: FormData): Promise<{ data?: { folio: string }; error?: string }> {
  try {
    const { data } = await httpClient.post("/ticket/extract", formData, {
      headers: await authHeaders(),
      timeout: 60_000,
    });
    return { data };
  } catch (error) {
    return { error: errorMessage(error, "No se pudo leer el ticket") };
  }
}

export async function listCfdiUses(rfc: string, regimen: string): Promise<{ id: string; descripcion: string }[]> {
  try {
    const { data } = await httpClient.get("/invoice/cfdi-uses", {
      params: { rfc, taxRegime: regimen },
      headers: await authHeaders(),
    });
    return data;
  } catch {
    return [];
  }
}

export async function cfdiStatus(uuid: string): Promise<"pending" | "stamped" | "unknown"> {
  try {
    const { data } = await httpClient.get(`/cfdi-demo/${uuid}/status`, {
      headers: await authHeaders(),
    });
    return data.status;
  } catch {
    return "pending"; // fallo transitorio: seguir esperando
  }
}
