import Link from "next/link";
import { isAxiosError } from "axios";
import { notFound, redirect } from "next/navigation";
import { httpClient, authHeaders } from "@/lib/http-client";
import { paginateResource } from "@/lib/paginate";
import { errorMessage, get, type Column } from "@/lib/resources";
import { PageHeader, ListError } from "@/components/page-header";
import { CellValue } from "@/components/cell-value";
import { RecordList } from "./record-list";

const DATA_FIELDS: Column[] = [
  { key: "email", label: "Correo" },
  { key: "preferredCsf.rfc", label: "CSF preferida" },
];

const TICKET_COLUMNS: Column[] = [
  { key: "externalTicketId", label: "Ticket" },
  { key: "ticketDate", label: "Fecha" },
  { key: "total", label: "Total" },
  { key: "status", label: "Estado" },
  { key: "invoice.status", label: "Factura" },
];

const CASE_COLUMNS: Column[] = [
  { key: "folio", label: "Folio" },
  { key: "description", label: "Descripción" },
  { key: "priority", label: "Prioridad" },
  { key: "status", label: "Estado" },
  { key: "slaDueAt", label: "SLA" },
  { key: "assignedUser.name", label: "Asignado" },
];

const BackLink = () => (
  <Link href="/customer" className="text-xs font-extrabold tracking-wider uppercase text-carbon/55 hover:underline">
    ← Clientes
  </Link>
);

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let customer: Record<string, unknown>;
  try {
    const { data } = await httpClient.get(`/customer/${id}`, { headers: await authHeaders() });
    customer = data;
  } catch (error) {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401) redirect("/login");
      if (status === 404 || status === 400) notFound();
    }
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <BackLink />
        <ListError message={errorMessage(error, "No se pudo cargar el cliente")} retryHref={`/customer/${id}`} />
      </div>
    );
  }

  const name = customer.name ? String(customer.name) : null;
  const phone = String(customer.normalizedPhone ?? "");

  // ponytail: hasta 100 por sección para el resumen; las tablas muestran 10.
  const [tickets, cases] = await Promise.all([
    paginateResource("ticket", 0, undefined, undefined, undefined, { customerId: id, limit: "100" }),
    paginateResource("case", 0, undefined, undefined, undefined, { customerId: id, limit: "100" }),
  ]);

  const billables = tickets.records.filter((r) => String(get(r, "status") ?? "") === "billable");
  const pendingAmount = billables.reduce((sum, r) => sum + (Number(get(r, "total") ?? 0) || 0), 0);
  const openCases = cases.records.filter((r) =>
    ["new", "assigned", "in_progress"].includes(String(get(r, "status") ?? "")),
  );
  const nextSla =
    openCases
      .map((r) => String(get(r, "slaDueAt") ?? ""))
      .filter((s) => /^\d{4}-\d{2}-\d{2}/.test(s) && !Number.isNaN(new Date(s).getTime()))
      .sort()[0] ?? null;

  const listParams = new URLSearchParams({ customerId: id });
  if (name) listParams.set("customerName", name);
  if (phone) listParams.set("customerPhone", phone);
  const listQuery = listParams.toString();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <BackLink />

      <PageHeader
        title={name ?? phone}
        accent="marchantitx"
        description={name ? phone : "Sin nombre registrado"}
      />

      <section className="elevacion rounded-2xl border border-carbon/10 bg-tiza px-5 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DATA_FIELDS.map((field) => (
            <div key={field.key}>
              <dt className="text-[11px] font-extrabold tracking-wider uppercase text-carbon/70">{field.label}</dt>
              <dd className="mt-1 text-sm font-semibold tabular">
                <CellValue value={get(customer, field.key)} fieldKey={field.key} />
              </dd>
            </div>
          ))}
        </dl>
        {tickets.total + cases.total > 0 && (
          <div aria-label="Resumen" className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-carbon/10 pt-4 text-sm">
            <p>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-carbon/70">Facturable · </span>
              <span className="font-bold">
                {billables.length} · <CellValue value={pendingAmount} fieldKey="total" />
              </span>
            </p>
            <p>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-carbon/70">Tickets · </span>
              <span className="font-bold tabular">{tickets.total}</span>
            </p>
            <p>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-carbon/70">Casos abiertos · </span>
              <span className="font-bold tabular">
                {openCases.length} de {cases.total}
              </span>
            </p>
            <p>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-carbon/70">Próximo SLA · </span>
              <span className="font-bold">
                {nextSla ? <CellValue value={nextSla} fieldKey="slaDueAt" /> : <span className="text-carbon/30">—</span>}
              </span>
            </p>
          </div>
        )}
      </section>

      <RecordList
        title="Tickets y facturas"
        columns={TICKET_COLUMNS}
        records={tickets.records.slice(0, 10)}
        total={tickets.total}
        error={tickets.error}
        retryHref={`/customer/${id}`}
        emptyMessage="Este marchantitx aún no tiene tickets."
        emptyHint="Aquí verás sus compras y su estado de facturación."
        viewAllHref={`/ticket?${listQuery}`}
        rowNoun="ticket"
        getRowHref={(record) => {
          const folio = get(record, "externalTicketId");
          return folio ? `/ticket?search=${encodeURIComponent(String(folio))}` : undefined;
        }}
      />

      <RecordList
        title="Casos"
        columns={CASE_COLUMNS}
        records={cases.records.slice(0, 10)}
        total={cases.total}
        error={cases.error}
        retryHref={`/customer/${id}`}
        emptyMessage="Este marchantitx aún no tiene casos."
        emptyHint="Aquí verás sus reportes, su prioridad y su SLA."
        viewAllHref={`/case?${listQuery}`}
        rowNoun="caso"
        getRowHref={(record) => {
          const folio = get(record, "folio");
          return folio ? `/case?search=${encodeURIComponent(String(folio))}` : undefined;
        }}
      />
    </div>
  );
}
