import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "normalizedPhone", label: "Teléfono" },
  { key: "name", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "preferredCsf.rfc", label: "CSF preferida" },
];

const fields: Field[] = [
  {
    name: "normalizedPhone",
    label: "Teléfono",
    type: "text",
    required: true,
    placeholder: "+5215512345678",
  },
  { name: "name", label: "Nombre", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "preferredCsfId", label: "CSF preferida (id)", type: "text", from: "preferredCsf.id" },
];

export default async function CustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("customer", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="Clientes" accent="marchantitx" description="Registrados por teléfono. Da clic para ver el menú de cada uno." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="customer"
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
