"use client";

// Filtro de sucursal para ticket: form GET con hidden inputs para conservar
// search/sort/order (mismo patrón que la barra de búsqueda de resource-table.tsx).
// El offset se resetea al no incluirse.
export function BranchFilter({
  branches,
  branchId,
  search,
  sort,
  order,
}: {
  branches: { id: string; name: string }[];
  branchId?: string;
  search?: string;
  sort?: string;
  order?: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      {search && <input type="hidden" name="search" value={search} />}
      {sort && <input type="hidden" name="sort" value={sort} />}
      {sort && order && <input type="hidden" name="order" value={order} />}
      <select
        name="branchId"
        defaultValue={branchId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Filtrar por sucursal"
      >
        <option value="">Todas</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
    </form>
  );
}
