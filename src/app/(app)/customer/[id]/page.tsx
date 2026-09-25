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
  { key: "normalizedPhone", label: "Teléfono" },
  { key: "name", label: "Nombre" },
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
        <ListError message={errorMessage(error, "No se pudo cargar el cliente")} />
      </div>
    );
  }

  const name = customer.name ? String(customer.name) : null;
  const phone = String(customer.normalizedPhone ?? "");

  const [tickets, cases] = await Promise.all([
    paginateResource("ticket", 0, undefined, undefined, undefined, { customerId: id }),
    paginateResource("case", 0, undefined, undefined, undefined, { customerId: id }),
  ]);

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
                <CellValue value={get(customer, field.key)} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <RecordList
        title="Tickets y facturas"
        columns={TICKET_COLUMNS}
        records={tickets.records}
        total={tickets.total}
        error={tickets.error}
        emptyMessage="Este marchantitx aún no tiene tickets."
        viewAllHref={phone ? `/ticket?search=${encodeURIComponent(phone)}` : undefined}
      />

      <RecordList
        title="Casos"
        columns={CASE_COLUMNS}
        records={cases.records}
        total={cases.total}
        error={cases.error}
        emptyMessage="Este marchantitx aún no tiene casos."
        viewAllHref={name ? `/case?search=${encodeURIComponent(name)}` : undefined}
      />
    </div>
  );
}
