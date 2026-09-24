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
  { key: "status", label: "Estatus" },
  { key: "slaDueAt", label: "SLA", sortable: true },
  { key: "assignedUser.name", label: "Asignado", sortable: true },
];

const fields: Field[] = [
  { name: "folio", label: "Folio", type: "text", required: true },
  { name: "description", label: "Descripción", type: "text", required: true },
  { name: "categoryId", label: "Categoría (id)", type: "text", required: true },
  { name: "areaId", label: "Área (id)", type: "text", required: true },
  {
    name: "priority",
    label: "Prioridad",
    type: "select",
    required: true,
    options: PRIORITY_OPTIONS,
  },
  { name: "status", label: "Estatus", type: "select", options: STATUS_OPTIONS },
  { name: "slaDueAt", label: "SLA", type: "datetime", required: true },
  {
    name: "customerId",
    label: "Cliente (id)",
    type: "text",
    from: "customer.id",
  },
  { name: "customerNameSnapshot", label: "Nombre cliente", type: "text" },
  {
    name: "assignedUserId",
    label: "Asignado (id)",
    type: "text",
    from: "assignedUser.id",
  },
  { name: "branchId", label: "Sucursal (id)", type: "text", from: "branch.id" },
];

export default async function CasePage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "case",
    offset,
    search,
    sort,
    order,
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
        accent=""
        description="Soporte y seguimiento: prioridad, asignado y estatus."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
