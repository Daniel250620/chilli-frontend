import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const STATUS_OPTIONS = ["validated", "billable", "invoiced", "rejected"] as const;

const columns: Column[] = [
  { key: "externalTicketId", label: "Ticket" },
  { key: "customer.normalizedPhone", label: "Cliente" },
  { key: "branch.name", label: "Sucursal" },
  { key: "ticketDate", label: "Fecha" },
  { key: "total", label: "Total" },
  { key: "status", label: "Estatus" },
];

const fields: Field[] = [
  { name: "externalTicketId", label: "Ticket externo", type: "text", required: true },
  { name: "customerId", label: "Cliente (id)", type: "text", required: true, from: "customer.id" },
  { name: "branchId", label: "Sucursal (id)", type: "text", from: "branch.id" },
  { name: "ticketDate", label: "Fecha", type: "datetime", required: true },
  { name: "total", label: "Total", type: "number", required: true },
  { name: "currency", label: "Moneda", type: "text" },
  { name: "status", label: "Estatus", type: "select", required: true, options: STATUS_OPTIONS },
  { name: "rawResponse", label: "Respuesta cruda", type: "json" },
];

export default async function TicketPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("ticket", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="Tickets" accent="del POS" description="Lo que salió en caja: validados, facturables y facturados." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="ticket"
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
