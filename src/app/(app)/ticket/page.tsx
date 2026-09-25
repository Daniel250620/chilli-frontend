import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { getSession } from "@/lib/session";
import type { Column, Field } from "@/lib/resources";
import { BranchFilter } from "./branch-filter";

const STATUS_OPTIONS = ["validated", "billable", "invoiced", "rejected"] as const;

const columns: Column[] = [
  { key: "externalTicketId", label: "Ticket", sortable: true },
  { key: "customer.normalizedPhone", label: "Cliente", sortable: true },
  { key: "branch.name", label: "Sucursal", sortable: true },
  { key: "ticketDate", label: "Fecha", sortable: true },
  { key: "total", label: "Total", sortable: true },
  { key: "status", label: "Estado" },
];

const fields: Field[] = [
  { name: "externalTicketId", label: "Ticket externo", type: "text", required: true, placeholder: "Folio del POS" },
  { name: "customerId", label: "Cliente", type: "text", required: true, from: "customer.id", placeholder: "Se elige al cobrar en caja" },
  { name: "branchId", label: "Sucursal", type: "text", from: "branch.id", placeholder: "Sucursal donde se vendió" },
  { name: "ticketDate", label: "Fecha", type: "datetime", required: true },
  { name: "total", label: "Total", type: "number", required: true, placeholder: "0.00" },
  { name: "currency", label: "Moneda", type: "text", placeholder: "MXN" },
  { name: "status", label: "Estado", type: "select", required: true, options: STATUS_OPTIONS },
  { name: "rawResponse", label: "Respuesta del POS (JSON)", type: "json" },
];

export default async function TicketPage({
  searchParams,
}: {
  searchParams: Promise<{
    offset?: string;
    search?: string;
    sort?: string;
    order?: string;
    branchId?: string;
  }>;
}) {
  const { offset: offsetParam, search, sort, order, branchId } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "ticket",
    offset,
    search,
    sort,
    order,
    branchId ? { branchId } : undefined,
  );

  // ponytail: chequeo de rol inline, primer caso de UI condicionada por rol.
  // Mover a un helper compartido (isAdmin()/can()) cuando exista la matriz de permisos.
  const session = await getSession();
  const isAdmin = session?.user.rol === "Administrador";
  const branches = isAdmin
    ? (
        await paginateResource("branch", 0, undefined, undefined, undefined, { limit: "100" })
      ).records
    : [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="ticket"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Tickets"
        accent="del POS"
        description="Lo que salió en caja: validados, facturables y facturados."
        error={error}
        search={search}
        sort={sort}
        order={order}
        extraParams={branchId ? { branchId } : undefined}
        filters={
          isAdmin && (
            <BranchFilter
              branches={branches.map((b) => ({ id: String(b.id), name: String(b.name) }))}
              branchId={branchId}
              search={search}
              sort={sort}
              order={order}
            />
          )
        }
      />
    </div>
  );
}
