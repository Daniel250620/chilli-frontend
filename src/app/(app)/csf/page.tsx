import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "rfc", label: "RFC", sortable: true },
  { key: "socialReason", label: "Razón social", sortable: true },
  { key: "postalCode", label: "CP", sortable: true },
  { key: "customer.normalizedPhone", label: "Cliente", sortable: true },
  { key: "isPreferred", label: "Preferida", sortable: true },
];

const fields: Field[] = [
  { name: "customerId", label: "Cliente", type: "text", required: true, from: "customer.id", placeholder: "Dueño de la constancia" },
  { name: "rfc", label: "RFC", type: "text", required: true, placeholder: "XAXX010101000" },
  { name: "socialReason", label: "Razón social", type: "text", required: true },
  { name: "postalCode", label: "Código postal", type: "text", required: true },
  { name: "encryptedFileRef", label: "Referencia de archivo", type: "text", required: true },
  { name: "hash", label: "Folio de verificación", type: "text", required: true },
  { name: "parsedJson", label: "Datos extraídos (JSON)", type: "json", required: true },
  { name: "taxRegimes", label: "Regímenes fiscales (JSON)", type: "json", required: true },
  {
    name: "extractionConfidence",
    label: "Confianza de extracción",
    type: "number",
    required: true,
  },
  { name: "isPreferred", label: "Preferida", type: "checkbox" },
  { name: "consentAt", label: "Consentimiento", type: "datetime" },
];

export default async function CsfPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "csf",
    offset,
    search,
    sort,
    order,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="csf"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="CSF"
        accent="fiscal"
        description="Constancias parseadas: RFC, razón social y confianza de extracción."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
