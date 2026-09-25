"use client";

import { usePathname, useRouter } from "next/navigation";

// Filtro de sucursal para ticket: navegación de cliente (sin recarga) que
// conserva search/sort/order. El offset se resetea al no incluirse.
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
  const router = useRouter();
  const pathname = usePathname();

  function pushWithBranch(nextBranchId: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (sort && order) params.set("order", order);
    if (nextBranchId) params.set("branchId", nextBranchId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Va dentro del <form> de búsqueda de ResourceTable (vía prop `filters`), no
  // trae su propio <form>: un <form> anidado sería HTML inválido.
  return (
    <div className="flex items-center gap-2">
      <select
        id="branch-filter"
        name="branchId"
        key={branchId ?? ""}
        defaultValue={branchId ?? ""}
        onChange={(e) => pushWithBranch(e.currentTarget.value)}
        aria-label="Filtrar tickets por sucursal"
        className="w-auto min-w-52"
      >
        <option value="">Todas las sucursales</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      {branchId && (
        <button
          type="button"
          onClick={() => pushWithBranch("")}
          className="text-xs font-extrabold tracking-wide text-pizarra-oscuro uppercase hover:underline"
        >
          Limpiar filtro
        </button>
      )}
    </div>
  );
}
