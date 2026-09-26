import Link from "next/link";
import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { getSession } from "@/lib/session";
import type { Column, Field } from "@/lib/resources";
import { BranchFilter } from "./branch-filter";

const STATUS_OPTIONS = ["validated", "billable", "invoiced", "rejected"] as const;
const CURRENCY_OPTIONS = ["MXN", "USD"] as const;

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
  { name: "customerId", label: "Cliente", type: "autocomplete", required: true, from: "customer.id", resource: "customer", displayFields: ["name", "normalizedPhone"], placeholder: "Buscar por nombre o teléfono…" },
  { name: "branchId", label: "Sucursal", type: "autocomplete", from: "branch.id", resource: "branch", displayFields: ["name"], placeholder: "Buscar por nombre…" },
  { name: "ticketDate", label: "Fecha", type: "datetime", required: true },
  { name: "total", label: "Total", type: "number", required: true, placeholder: "0.00" },
  { name: "currency", label: "Moneda", type: "select", options: CURRENCY_OPTIONS },
  { name: "status", label: "Estado", type: "select", required: true, options: STATUS_OPTIONS },
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
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
  }>;
}) {
  const { offset: offsetParam, search, sort, order, branchId, customerId, customerName, customerPhone } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  // ponytail: a la API solo van filtros reales; nombre/teléfono solo adornan
  // la URL y el chip de retorno.
  const apiExtra = {
    ...(branchId ? { branchId } : {}),
    ...(customerId ? { customerId } : {}),
  };
  const urlExtra = {
    ...apiExtra,
    ...(customerName ? { customerName } : {}),
    ...(customerPhone ? { customerPhone } : {}),
  };
  const { records, total, limit, error } = await paginateResource(
    "ticket",
    offset,
    search,
    sort,
    order,
    Object.keys(apiExtra).length > 0 ? apiExtra : undefined,
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
        extraParams={Object.keys(urlExtra).length > 0 ? urlExtra : undefined}
        filters={
          <>
            {isAdmin && (
              <BranchFilter
                key={`${branchId ?? ""}-${customerId ?? ""}`}
                branches={branches.map((b) => ({ id: String(b.id), name: String(b.name) }))}
                branchId={branchId}
                search={search}
                sort={sort}
                order={order}
                customerId={customerId}
                customerName={customerName}
                customerPhone={customerPhone}
              />
            )}
            {customerId && (
              <Link
                href={`/customer/${encodeURIComponent(customerId)}`}
                className="rounded-xl border border-carbon/15 bg-carbon/[0.03] px-3 py-2 text-xs font-extrabold tracking-wider uppercase text-carbon/60 hover:underline"
                title="Volver al cliente"
              >
                Cliente · {customerName || customerPhone || customerId.slice(0, 8)} ↩
              </Link>
            )}
          </>
        }
      />
    </div>
  );
}
