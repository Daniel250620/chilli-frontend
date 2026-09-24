import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "name", label: "Nombre" },
  { key: "address", label: "Dirección" },
  { key: "phone", label: "Teléfono" },
  { key: "serie", label: "Serie" },
  { key: "isActive", label: "Activa" },
  { key: "hasDelivery", label: "Entrega" },
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
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource("branch", offset);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader title="Sucursales" accent="de la fonda" description="Marchantitx, aquí están las fondas físicas: serie, entrega y ubicación." total={error ? undefined : total} />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="branch"
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
