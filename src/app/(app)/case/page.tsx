import Link from "next/link";
import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;
const STATUS_OPTIONS = [
  "new",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
] as const;

const columns: Column[] = [
  { key: "folio", label: "Folio", sortable: true },
  { key: "description", label: "Descripción" },
  { key: "priority", label: "Prioridad" },
  { key: "status", label: "Estado" },
  { key: "slaDueAt", label: "SLA", sortable: true },
  { key: "assignedUser.name", label: "Asignado", sortable: true },
];

const fields: Field[] = [
  {
    name: "folio",
    label: "Folio",
    type: "text",
    required: true,
    placeholder: "CAS-0001",
  },
  {
    name: "description",
    label: "Descripción",
    type: "text",
    required: true,
    placeholder: "¿Qué necesita el marchantitx?",
  },
  { name: "categoryId", label: "Categoría", type: "text", required: true },
  { name: "areaId", label: "Área", type: "text", required: true },
  {
    name: "priority",
    label: "Prioridad",
    type: "select",
    required: true,
    options: PRIORITY_OPTIONS,
  },
  { name: "status", label: "Estado", type: "select", options: STATUS_OPTIONS },
  { name: "slaDueAt", label: "SLA", type: "datetime", required: true },
  {
    name: "customerId",
    label: "Cliente",
    type: "text",
    from: "customer.id",
  },
  { name: "customerNameSnapshot", label: "Nombre del cliente", type: "text" },
  {
    name: "assignedUserId",
    label: "Persona asignada",
    type: "text",
    from: "assignedUser.id",
  },
  { name: "branchId", label: "Sucursal", type: "text", from: "branch.id" },
];

export default async function CasePage({
  searchParams,
}: {
  searchParams: Promise<{
    offset?: string;
    search?: string;
    sort?: string;
    order?: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
  }>;
}) {
  const { offset: offsetParam, search, sort, order, customerId, customerName, customerPhone } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const apiExtra = customerId ? { customerId } : undefined;
  const urlExtra = {
    ...(apiExtra ?? {}),
    ...(customerName ? { customerName } : {}),
    ...(customerPhone ? { customerPhone } : {}),
  };
  const { records, total, limit, error } = await paginateResource(
    "case",
    offset,
    search,
    sort,
    order,
    apiExtra,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="case"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Casos"
        accent="Reportados"
        description="Soporte y seguimiento: prioridad, asignado y estado."
        error={error}
        search={search}
        sort={sort}
        order={order}
        extraParams={Object.keys(urlExtra).length > 0 ? urlExtra : undefined}
        filters={
          customerId ? (
            <Link
              href={`/customer/${encodeURIComponent(customerId)}`}
              className="rounded-xl border border-carbon/15 bg-carbon/[0.03] px-3 py-2 text-xs font-extrabold tracking-wider uppercase text-carbon/60 hover:underline"
              title="Volver al cliente"
            >
              Cliente · {customerName || customerPhone || customerId.slice(0, 8)} ↩
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
