"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { saveRecord, deleteRecord, searchOptions, type ActionState } from "@/lib/actions/resource";
import { get, type Resource, type Column, type Field } from "@/lib/resources";
import { PageHeader, ListError } from "@/components/page-header";
import { CellValue, labelEs } from "@/components/cell-value";
import { Selector } from "@/components/selector";

const initialState: ActionState = {};

type SaveState = ActionState & { ok?: boolean };

const initialSaveState: SaveState = {};

async function saveAndMark(
  resource: Resource,
  id: string | null,
  fields: readonly Field[],
  prevState: ActionState,
  formData: FormData,
): Promise<SaveState> {
  const result = await saveRecord(resource, id, fields, prevState, formData);
  return result.error ? result : { ok: true };
}

function toLocalDatetimeInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultValueFor(field: Field, record: Record<string, unknown> | null) {
  if (!record) return undefined;
  const value = get(record, field.from ?? field.name);
  if (value == null) return undefined;
  if (field.type === "datetime") return toLocalDatetimeInput(String(value));
  if (field.type === "json") return JSON.stringify(value, null, 2);
  return String(value);
}

const RESOURCE_SINGULAR: Record<Resource, string> = {
  user: "usuario",
  customer: "cliente",
  ticket: "ticket",
  branch: "sucursal",
  invoice: "factura",
  csf: "CSF",
  case: "caso",
};

// Autocomplete mínimo: input de texto + lista de resultados de
// GET /{resource}/paginate?search=, debounced. El id elegido viaja en un
// input hidden con el mismo `name` que usaría un <input type="text"> plano,
// así que saveRecord no necesita saber que este campo es distinto.
function AutocompleteField({
  field,
  record,
}: {
  field: Field;
  record: Record<string, unknown> | null;
}) {
  const id = `field-${field.name}`;
  const initialLabel = (() => {
    if (!record) return "";
    const parentPath = (field.from ?? field.name).split(".").slice(0, -1).join(".");
    const parent = parentPath ? get(record, parentPath) : null;
    if (!parent) return "";
    return (field.displayFields ?? ["name"])
      .map((f) => (parent as Record<string, unknown>)[f])
      .filter(Boolean)
      .join(" · ");
  })();

  const [query, setQuery] = useState(initialLabel);
  const [selectedId, setSelectedId] = useState(defaultValueFor(field, record) ?? "");
  const [options, setOptions] = useState<{ id: string; label: string }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!query.trim() || query === initialLabel) {
        setOptions([]);
        return;
      }
      searchOptions(field.resource!, query, field.displayFields ?? ["name"]).then((results) => {
        setOptions(results);
        setOpen(true);
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="relative">
      <input type="hidden" name={field.name} value={selectedId} />
      <input
        id={id}
        type="text"
        value={query}
        placeholder={field.placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedId("");
        }}
        onFocus={() => options.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && options.length > 0 && (
        <ul className="elevacion absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-carbon/15 bg-white py-1 text-sm">
          {options.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-mostaza-tinta/60"
                onClick={() => {
                  setSelectedId(option.id);
                  setQuery(option.label);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FormField({
  field,
  record,
}: {
  field: Field;
  record: Record<string, unknown> | null;
}) {
  const id = `field-${field.name}`;
  // password: no se precarga (el backend no lo devuelve); solo se envía si se llena.
  const defaultValue = field.name === "password" ? undefined : defaultValueFor(field, record);
  const wide = field.type === "json";

  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={id} className="text-[11px] font-extrabold tracking-wider text-carbon/70 uppercase">
        {field.label}
        {field.required && <span aria-hidden className="ml-0.5 text-guajillo">*</span>}
      </label>
      {field.type === "autocomplete" ? (
        <AutocompleteField field={field} record={record} />
      ) : field.type === "checkbox" ? (
        <label htmlFor={id} className="flex items-center gap-2 rounded-xl border border-carbon/15 bg-carbon/[0.03] px-3 py-2.5 text-sm font-semibold">
          <input id={id} name={field.name} type="checkbox" defaultChecked={defaultValue === "true"} />
          {defaultValue === "true" ? "Activado" : "Desactivado"}
        </label>
      ) : field.type === "json" ? (
        <textarea id={id} name={field.name} required={field.required} defaultValue={defaultValue} rows={4} className="font-mono text-xs" />
      ) : field.type === "select" ? (
        <Selector
          id={id}
          name={field.name}
          required={field.required}
          defaultValue={defaultValue ?? ""}
          placeholder={field.required ? "Seleccionar…" : "Sin definir"}
          options={(field.options ?? []).map((option) => ({ value: option, label: labelEs(option) }))}
          className="w-full"
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type === "datetime" ? "datetime-local" : field.type}
          step={field.type === "number" ? "any" : undefined}
          required={field.required}
          defaultValue={defaultValue}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}

function RecordForm({
  resource,
  fields,
  editingId,
  record,
  onSaved,
  onClose,
}: {
  resource: Resource;
  fields: readonly Field[];
  editingId: string | null;
  record: Record<string, unknown> | null;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveAndMark.bind(null, resource, editingId, fields),
    initialSaveState,
  );

  useEffect(() => {
    if (state?.ok) onSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const singular = RESOURCE_SINGULAR[resource] ?? "registro";
  return (
    <form action={formAction} className="flex flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-carbon/10 bg-mostaza-tinta/70 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-extrabold tracking-wider uppercase">
            {editingId ? (
              <>Editar <span className="font-marker text-guajillo normal-case">{singular}</span></>
            ) : (
              <>Nuevo <span className="font-marker text-guajillo normal-case">{singular}</span></>
            )}
          </h2>
          <p className="mt-1 text-xs font-medium text-carbon/60">
            {editingId
              ? "Revisa los datos y guarda para aplicar los cambios."
              : "Completa los datos obligatorios (*) y guarda para darlo de alta."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl leading-none font-extrabold text-carbon/50 transition hover:bg-carbon/5 hover:text-carbon"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {fields.map((field) => (
          <FormField key={field.name} field={field} record={record} />
        ))}
      </div>
      {state?.error && (
        <p role="alert" className="mx-5 rounded-xl border border-guajillo/30 bg-guajillo/10 px-3 py-2 text-sm font-semibold text-guajillo sm:mx-6">
          No se pudo guardar: {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2 border-t border-carbon/10 bg-white/60 px-5 py-4 sm:px-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border-2 border-black bg-guajillo px-5 py-2.5 text-xs font-extrabold tracking-wider text-white uppercase shadow-[3px_3px_0_0_#000] transition duration-150 hover:-translate-y-0.5 hover:bg-guajillo-oscuro active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:translate-0 disabled:shadow-[3px_3px_0_0_#000]"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border-2 border-carbon/20 bg-white px-5 py-2.5 text-xs font-extrabold tracking-wider text-carbon uppercase transition duration-150 hover:border-carbon/50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function DeleteButton({ resource, id }: { resource: Resource; id: string }) {
  const [state, formAction, pending] = useActionState(
    deleteRecord.bind(null, resource, id),
    initialState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("¿Borrar este registro, marchantitx?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="flex min-h-[44px] items-center rounded-lg px-2.5 text-xs font-extrabold tracking-wide text-guajillo uppercase transition hover:bg-guajillo/10"
      >
        Borrar
      </button>
      {state?.error && <p role="alert" className="text-xs font-semibold text-guajillo">{state.error}</p>}
    </form>
  );
}

function baseParams(
  search?: string,
  sort?: string,
  order?: string,
  extraParams?: Record<string, string>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (sort && order) params.set("order", order);
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value) params.set(key, value);
  }
  return params;
}

function pageHref(
  offset: number,
  search?: string,
  sort?: string,
  order?: string,
  extraParams?: Record<string, string>,
): string {
  const params = baseParams(search, sort, order, extraParams);
  if (offset > 0) params.set("offset", String(offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

// Toggle: click col sin orden activo -> asc; click de nuevo -> desc; click otra
// columna -> asc. offset siempre se resetea.
function sortHref(
  col: Column,
  currentSort?: string,
  currentOrder?: string,
  search?: string,
  extraParams?: Record<string, string>,
): string {
  const nextOrder = col.key === currentSort && currentOrder === "asc" ? "desc" : "asc";
  const params = baseParams(search, col.key, nextOrder, extraParams);
  const qs = params.toString();
  return qs ? `?${qs}` : "?";
}

export function ResourceTable({
  resource,
  records,
  total,
  offset,
  limit,
  columns,
  fields,
  title,
  accent,
  description,
  error,
  search,
  sort,
  order,
  extraParams,
  filters,
  rowHref,
}: {
  resource: Resource;
  records: Record<string, unknown>[];
  total: number;
  offset: number;
  limit: number;
  columns: readonly Column[];
  fields: readonly Field[];
  title: string;
  accent: string;
  description: string;
  error?: string;
  search?: string;
  sort?: string;
  order?: string;
  extraParams?: Record<string, string>;
  filters?: React.ReactNode;
  rowHref?: string;
}) {
  const [mode, setMode] = useState<null | "new" | string>(null);
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editingId = mode && mode !== "new" ? mode : null;
  const editingRecord = records.find((r) => String(r.id) === editingId) ?? null;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mode !== null && !dialog.open) dialog.showModal();
    if (mode === null && dialog.open) dialog.close();
  }, [mode]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={title}
        accent={accent}
        description={description}
        action={
          <button
            type="button"
            onClick={() => setMode("new")}
            className="rounded-xl border-2 border-black bg-mostaza px-4 py-2 text-xs font-extrabold tracking-wider text-nota uppercase shadow-[3px_3px_0_0_#000] transition duration-150 hover:-translate-y-0.5"
          >
            + Crear
          </button>
        }
      />

      <form
        role="search"
        aria-label={`Buscar en ${title}`}
        onSubmit={(e) => {
          // Navegación de cliente (sin recarga de página): actualiza la URL y
          // el Server Component vuelve a pedir los datos. El offset se resetea.
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("search") as HTMLInputElement | null;
          const value = input?.value.trim() ?? "";
          const params = baseParams(value || undefined, sort, order, extraParams);
          const qs = params.toString();
          router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <div className="relative w-full max-w-sm">
          <span aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-carbon/40">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            name="search"
            key={search ?? ""}
            defaultValue={search}
            placeholder="Buscar por nombre, folio, RFC…"
            aria-label="Buscar"
            className="pr-9 pl-9"
          />
          {search && (
            <Link
              href={pageHref(0, undefined, sort, order, extraParams)}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-base leading-none font-bold text-carbon/40 transition hover:bg-carbon/5 hover:text-carbon"
            >
              ×
            </Link>
          )}
        </div>
        <button
          type="submit"
          className="rounded-xl border-2 border-black bg-mostaza px-4 py-2 text-xs font-extrabold tracking-wider text-nota uppercase shadow-[2px_2px_0_0_#000] transition duration-150 hover:-translate-y-0.5"
        >
          Buscar
        </button>
        {filters}
      </form>

      {error ? (
        <ListError message={error} />
      ) : (
        <>
          <div className="elevacion overflow-hidden rounded-2xl border border-carbon/10 bg-tiza">
            {records.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <p className="font-marker text-2xl text-guajillo">Nada por aquí…</p>
                <p className="mt-2 max-w-sm text-sm font-medium text-carbon/60">
                  Marchantitx, aún no hay registros. Usa el botón Crear para dar de alta el primero.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead className="sticky top-0 z-[1]">
                    <tr className="border-b border-carbon/10 bg-[#faf6ec] text-carbon">
                      {columns.map((col) => {
                        const active = col.sortable && col.key === sort;
                        const ariaSort = active ? (order === "desc" ? "descending" : "ascending") : undefined;
                        return (
                          <th
                            key={col.key}
                            scope="col"
                            aria-sort={ariaSort}
                            className="px-4 py-3 text-[11px] font-extrabold tracking-wider whitespace-nowrap uppercase"
                          >
                            {col.sortable ? (
                              <Link
                                href={sortHref(col, sort, order, search, extraParams)}
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                {col.label}
                                <span aria-hidden className={active ? "" : "opacity-40"}>
                                  {active && order === "desc" ? "▼" : "▲"}
                                </span>
                              </Link>
                            ) : (
                              col.label
                            )}
                          </th>
                        );
                      })}
                      <th scope="col" className="px-4 py-3 text-right text-[11px] font-extrabold tracking-wider uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, i) => (
                      <tr
                        key={String(record.id)}
                        className={`border-b border-carbon/8 transition last:border-0 hover:bg-mostaza-tinta/60 ${editingId === String(record.id) ? "bg-mostaza-tinta" : i % 2 === 1 ? "bg-carbon/[0.02]" : "bg-white"}`}
                      >
                        {columns.map((col, colIndex) => (
                          <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle" title={String(get(record, col.key) ?? "")}>
                            {colIndex === 0 && rowHref ? (
                              <Link href={`${rowHref}/${String(record.id)}`} className="hover:underline">
                                <CellValue value={get(record, col.key)} />
                              </Link>
                            ) : (
                              <CellValue value={get(record, col.key)} />
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-2 align-middle whitespace-nowrap">
                          <div className="flex min-h-[44px] items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setMode(String(record.id))}
                              aria-label={`Editar registro ${String(record.id).slice(0, 8)}`}
                              className="flex min-h-[44px] items-center rounded-lg px-2.5 text-xs font-extrabold tracking-wide text-pizarra-oscuro uppercase transition hover:bg-pizarra/15"
                            >
                              Editar
                            </button>
                            <DeleteButton resource={resource} id={String(record.id)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold tracking-wide text-carbon/55 uppercase">
              {total === 0
                ? "0 registros"
                : `${from}–${to} de ${total} · Página ${Math.floor(offset / limit) + 1} de ${Math.max(1, Math.ceil(total / limit))}`}
            </p>
            <div className="flex gap-2">
              {offset > 0 ? (
                <Link
                  href={pageHref(Math.max(0, offset - limit), search, sort, order, extraParams)}
                  className="rounded-xl border-2 border-carbon/20 bg-white px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition hover:border-carbon/60"
                >
                  ← Anterior
                </Link>
              ) : (
                <span aria-disabled className="rounded-xl border-2 border-carbon/10 bg-white/60 px-4 py-2 text-xs font-extrabold tracking-wider text-carbon/30 uppercase">
                  ← Anterior
                </span>
              )}
              {offset + limit < total ? (
                <Link
                  href={pageHref(offset + limit, search, sort, order, extraParams)}
                  className="rounded-xl border-2 border-black bg-mostaza px-4 py-2 text-xs font-extrabold tracking-wider text-nota uppercase shadow-[3px_3px_0_0_#000] transition duration-150 hover:-translate-y-0.5"
                >
                  Siguiente →
                </Link>
              ) : (
                <span aria-disabled className="rounded-xl border-2 border-carbon/10 bg-white/60 px-4 py-2 text-xs font-extrabold tracking-wider text-carbon/30 uppercase">
                  Siguiente →
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setMode(null)}
        className="modal elevacion rounded-2xl border border-carbon/10 bg-tiza"
      >
        {mode !== null && (
          <RecordForm
            key={mode}
            resource={resource}
            fields={fields}
            editingId={editingId}
            record={editingRecord}
            onSaved={() => setMode(null)}
            onClose={() => dialogRef.current?.close()}
          />
        )}
      </dialog>
    </div>
  );
}
