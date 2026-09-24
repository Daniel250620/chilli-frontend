import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "lastName", label: "Apellido", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "phone", label: "Teléfono", sortable: true },
  { key: "rol.name", label: "Rol", sortable: true },
  { key: "branch.name", label: "Sucursal", sortable: true },
  { key: "status", label: "Activo" },
];

const fields: Field[] = [
  { name: "name", label: "Nombre", type: "text", required: true },
  { name: "lastName", label: "Apellido", type: "text", required: true },
  {
    name: "secondLastName",
    label: "Segundo apellido",
    type: "text",
    required: true,
  },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "phone", label: "Teléfono", type: "text", required: true },
  { name: "password", label: "Contraseña", type: "text" },
  {
    name: "rolId",
    label: "Rol (id)",
    type: "text",
    required: true,
    from: "rol.id",
  },
  { name: "branchId", label: "Sucursal (id)", type: "text", from: "branch.id" },
  { name: "position", label: "Puesto", type: "text" },
  { name: "status", label: "Activo", type: "checkbox" },
];

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ offset?: string; search?: string; sort?: string; order?: string }>;
}) {
  const { offset: offsetParam, search, sort, order } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "user",
    offset,
    search,
    sort,
    order,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <ResourceTable
        resource="user"
        records={records}
        total={total}
        offset={offset}
        limit={limit}
        columns={columns}
        fields={fields}
        title="Usuarios"
        accent="de la casa"
        description="Marchantitx, quien atiende la fonda: roles, sucursales y accesos."
        error={error}
        search={search}
        sort={sort}
        order={order}
      />
    </div>
  );
}
