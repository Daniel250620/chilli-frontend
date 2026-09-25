import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const STATUS_OPTIONS = ["draft", "sending", "issued", "error", "cancelled"] as const;

const columns: Column[] = [
  { key: "rfcSnapshot", label: "RFC", sortable: true },
  { key: "businessNameSnapshot", label: "Razón social", sortable: true },
  { key: "cfdiUse", label: "Uso CFDI", sortable: true },
  { key: "status", label: "Estado" },
  { key: "fiscalUuid", label: "UUID fiscal", sortable: true },
];

const fields: Field[] = [
  { name: "ticketId", label: "Ticket", type: "text", required: true, from: "ticket.id", placeholder: "Ticket que se factura" },
  { name: "csfId", label: "CSF", type: "text", required: true, from: "csf.id", placeholder: "Constancia fiscal usada" },
  { name: "cfdiUse", label: "Uso de CFDI", type: "text", required: true, placeholder: "G03, S01…" },
  { name: "rfcSnapshot", label: "RFC", type: "text", required: true },
  { name: "businessNameSnapshot", label: "Razón social", type: "text", required: true },
  { name: "fiscalZipSnapshot", label: "Código postal fiscal", type: "text", required: true },
  { name: "taxRegimeSnapshot", label: "Régimen fiscal", type: "text", required: true },
  { name: "status", label: "Estado", type: "select", required: true, options: STATUS_OPTIONS },
  { name: "idempotencyKey", label: "Clave de idempotencia", type: "text", required: true, placeholder: "Se genera en automático" },
  { name: "externalInvoiceId", label: "Folio externo", type: "text" },
  { name: "fiscalUuid", label: "UUID fiscal", type: "text" },
  { name: "pdfRef", label: "PDF (referencia)", type: "text" },
  { name: "xmlRef", label: "XML (referencia)", type: "text" },
];

export default async function InvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "invoice",
    offset,
    search,
    sort,
    order,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="invoice"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Facturas"
        accent="al momento"
        description="Del ticket al CFDI: RFC, régimen, uso y UUID fiscal."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
