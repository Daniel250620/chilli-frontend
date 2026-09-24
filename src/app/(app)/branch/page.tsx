import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "address", label: "Dirección", sortable: true },
  { key: "phone", label: "Teléfono", sortable: true },
  { key: "serie", label: "Serie", sortable: true },
  { key: "isActive", label: "Activa", sortable: true },
  { key: "hasDelivery", label: "Entrega", sortable: true },
];

const fields: Field[] = [
  { name: "name", label: "Nombre", type: "text", required: true },
  { name: "address", label: "Dirección", type: "text", required: true },
  { name: "phone", label: "Teléfono", type: "text", required: true },
  { name: "latitude", label: "Latitud", type: "number", required: true },
  { name: "longitude", label: "Longitud", type: "number", required: true },
  { name: "serie", label: "Serie", type: "text" },
  { name: "isActive", label: "Activa", type: "checkbox" },
  { name: "hasDelivery", label: "Entrega", type: "checkbox" },
];

export default async function BranchPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "branch",
    offset,
    search,
    sort,
    order,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="branch"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Sucursales"
        accent="de la fonda"
        description="Marchantitx, aquí están las fondas físicas: serie, entrega y ubicación."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
