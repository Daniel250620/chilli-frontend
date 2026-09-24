import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "rfc", label: "RFC" },
  { key: "socialReason", label: "Razón social" },
  { key: "postalCode", label: "CP" },
  { key: "customer.normalizedPhone", label: "Cliente" },
  { key: "isPreferred", label: "Preferida" },
];

const fields: Field[] = [
  { name: "customerId", label: "Cliente (id)", type: "text", required: true, from: "customer.id" },
  { name: "rfc", label: "RFC", type: "text", required: true },
  { name: "socialReason", label: "Razón social", type: "text", required: true },
  { name: "postalCode", label: "CP", type: "text", required: true },
  { name: "encryptedFileRef", label: "Archivo (ref)", type: "text", required: true },
  { name: "hash", label: "Hash", type: "text", required: true },
  { name: "parsedJson", label: "JSON parseado", type: "json", required: true },
  { name: "taxRegimes", label: "Regímenes fiscales", type: "json", required: true },
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
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("csf", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="CSF" accent="fiscal" description="Constancias parseadas: RFC, razón social y confianza de extracción." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="csf"
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
