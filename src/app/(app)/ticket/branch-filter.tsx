"use client";

import { usePathname, useRouter } from "next/navigation";
import { Selector } from "@/components/selector";

// Filtro de sucursal para ticket: navegación de cliente (sin recarga) que
// conserva search/sort/order. El offset se resetea al no incluirse.
export function BranchFilter({
  branches,
  branchId,
  search,
  sort,
  order,
  customerId,
  customerName,
  customerPhone,
}: {
  branches: { id: string; name: string }[];
  branchId?: string;
  search?: string;
  sort?: string;
  order?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function pushWithBranch(nextBranchId: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);
    if (sort && order) params.set("order", order);
    if (nextBranchId) params.set("branchId", nextBranchId);
    if (customerId) params.set("customerId", customerId);
    if (customerName) params.set("customerName", customerName);
    if (customerPhone) params.set("customerPhone", customerPhone);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Va dentro del <form> de búsqueda de ResourceTable (vía prop `filters`), no
  // trae su propio <form>: un <form> anidado sería HTML inválido.
  return (
    <div className="flex items-center gap-2">
      <Selector
        id="branch-filter"
        name="branchId"
        key={branchId ?? ""}
        defaultValue={branchId ?? ""}
        onChange={pushWithBranch}
        ariaLabel="Filtrar tickets por sucursal"
        className="w-auto min-w-52"
        placeholder="Todas las sucursales"
        options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
      />
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
