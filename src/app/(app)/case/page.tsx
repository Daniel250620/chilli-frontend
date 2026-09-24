import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;
const STATUS_OPTIONS = ["new", "assigned", "in_progress", "resolved", "closed"] as const;

const columns: Column[] = [
  { key: "folio", label: "Folio" },
  { key: "description", label: "Descripción" },
  { key: "priority", label: "Prioridad" },
  { key: "status", label: "Estatus" },
  { key: "slaDueAt", label: "SLA" },
  { key: "assignedUser.name", label: "Asignado" },
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
  { name: "customerId", label: "Cliente (id)", type: "text", from: "customer.id" },
  { name: "customerNameSnapshot", label: "Nombre cliente", type: "text" },
  { name: "assignedUserId", label: "Asignado (id)", type: "text", from: "assignedUser.id" },
  { name: "branchId", label: "Sucursal (id)", type: "text", from: "branch.id" },
];

export default async function CasePage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("case", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="Casos" accent="con SLA" description="Soporte y seguimiento: prioridad, asignado y estatus." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="case"
          records={records}
          total={total}
          offset={offset}
          limit={limit}
          columns={columns}
          fields={fields}
        />
      )}
    </div>
  );
}
