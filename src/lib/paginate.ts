// Server-only (httpClient throws if imported from a Client Component).
// Not a Server Action: GET /paginate is a read, done from the Server
// Component that renders the page, not from a mutating action.

import { isAxiosError } from "axios";
import { redirect } from "next/navigation";
import { httpClient, authHeaders } from "@/lib/http-client";
import { errorMessage, type Resource } from "@/lib/resources";

const LIMIT = 10;

export async function paginateResource(resource: Resource, offset: number) {
  try {
    const { data } = await httpClient.get(`/${resource}/paginate`, {
      params: { limit: LIMIT, offset },
      headers: await authHeaders(),
    });
    return {
      records: data.records as Record<string, unknown>[],
      total: (data.totalRecords ?? data.total ?? 0) as number,
      limit: LIMIT,
      offset,
      error: undefined as string | undefined,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) redirect("/login");
    return {
      records: [] as Record<string, unknown>[],
      total: 0,
      limit: LIMIT,
      offset,
      error: errorMessage(error, "No se pudo cargar el listado"),
    };
  }
}
