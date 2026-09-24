import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "normalizedPhone", label: "Teléfono", sortable: true },
  { key: "name", label: "Nombre", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "preferredCsf.rfc", label: "CSF preferida", sortable: true },
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
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "customer",
    offset,
    search,
    sort,
    order,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="customer"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Clientes"
        accent="marchantitx"
        description="Registrados por teléfono. Da clic para ver el menú de cada uno."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
