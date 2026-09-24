import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const STATUS_OPTIONS = ["draft", "sending", "issued", "error", "cancelled"] as const;

const columns: Column[] = [
  { key: "rfcSnapshot", label: "RFC" },
  { key: "businessNameSnapshot", label: "Razón social" },
  { key: "cfdiUse", label: "Uso CFDI" },
  { key: "status", label: "Estatus" },
  { key: "fiscalUuid", label: "UUID fiscal" },
];

const fields: Field[] = [
  { name: "ticketId", label: "Ticket (id)", type: "text", required: true, from: "ticket.id" },
  { name: "csfId", label: "CSF (id)", type: "text", required: true, from: "csf.id" },
  { name: "cfdiUse", label: "Uso CFDI", type: "text", required: true },
  { name: "rfcSnapshot", label: "RFC", type: "text", required: true },
  { name: "businessNameSnapshot", label: "Razón social", type: "text", required: true },
  { name: "fiscalZipSnapshot", label: "CP fiscal", type: "text", required: true },
  { name: "taxRegimeSnapshot", label: "Régimen fiscal", type: "text", required: true },
  { name: "status", label: "Estatus", type: "select", required: true, options: STATUS_OPTIONS },
  { name: "idempotencyKey", label: "Idempotency key", type: "text", required: true },
  { name: "externalInvoiceId", label: "Id externo", type: "text" },
  { name: "fiscalUuid", label: "UUID fiscal", type: "text" },
  { name: "pdfRef", label: "PDF", type: "text" },
  { name: "xmlRef", label: "XML", type: "text" },
];

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("invoice", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="Facturas" accent="al momento" description="Del ticket al CFDI: RFC, régimen, uso y UUID fiscal." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="invoice"
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
