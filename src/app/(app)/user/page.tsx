import { paginateResource } from "@/lib/paginate";
import { ResourceTable } from "@/components/resource-table";
import { PageHeader, ListError } from "@/components/page-header";
import type { Column, Field } from "@/lib/resources";

const columns: Column[] = [
  { key: "name", label: "Nombre" },
  { key: "lastName", label: "Apellido" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono" },
  { key: "rol.name", label: "Rol" },
  { key: "branch.name", label: "Sucursal" },
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
  searchParams: Promise<{ offset?: string }>;
}) {
  const { offset: offsetParam } = await searchParams;
  const offset = Number(offsetParam ?? 0);
  const { records, total, limit, error } = await paginateResource(
    "user",
    offset,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <PageHeader
        title="Usuarios"
        accent="de la casa"
        description="Marchantitx, quien atiende la fonda: roles, sucursales y accesos."
        total={error ? undefined : total}
      />
      {error ? (
        <ListError message={error} />
      ) : (
        <ResourceTable
          resource="user"
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
