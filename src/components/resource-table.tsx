"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { saveRecord, deleteRecord, type ActionState } from "@/lib/actions/resource";
import { get, type Resource, type Column, type Field } from "@/lib/resources";
import { PageHeader, ListError } from "@/components/page-header";

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

function toneFor(value: unknown): string {
  const v = String(value ?? "").toLowerCase();
  if (["rejected", "error", "cancelled", "cancelado", "critical", "no", "false", "inactivo"].includes(v))
    return "border-guajillo/30 bg-guajillo/10 text-guajillo";
  if (["invoiced", "issued", "resolved", "closed", "sí", "si", "true", "activo", "preferida"].includes(v))
    return "border-emerald-700/25 bg-emerald-50 text-emerald-800";
  if (["billable", "sending", "in_progress", "assigned", "medium", "high", "validated", "new"].includes(v))
    return "border-pizarra/40 bg-pizarra/15 text-pizarra-oscuro";
  if (["draft", "low"].includes(v))
    return "border-mostaza-claro bg-mostaza-tinta text-nota";
  return "border-carbon/15 bg-carbon/5 text-carbon/70";
}

function CellValue({ value }: { value: unknown }) {
  if (typeof value === "boolean")
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneFor(value ? "sí" : "no")}`}>
        {value ? "Sí" : "No"}
      </span>
    );
  if (value == null || value === "") return <span className="text-carbon/30">—</span>;
  const str = String(value);
  if (/^(validated|billable|invoiced|rejected|draft|sending|issued|error|cancelled|new|assigned|in_progress|resolved|closed|low|medium|high|critical)$/i.test(str))
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneFor(str)}`}>
        {str.replace("_", " ")}
      </span>
    );
  return <span className="tabular">{str}</span>;
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
      {field.type === "checkbox" ? (
        <label htmlFor={id} className="flex items-center gap-2 rounded-xl border border-carbon/15 bg-carbon/[0.03] px-3 py-2.5 text-sm font-semibold">
          <input id={id} name={field.name} type="checkbox" defaultChecked={defaultValue === "true"} />
          {defaultValue === "true" ? "Activado" : "Desactivado"}
        </label>
      ) : field.type === "json" ? (
        <textarea id={id} name={field.name} required={field.required} defaultValue={defaultValue} rows={4} className="font-mono text-xs" />
      ) : field.type === "select" ? (
        <select id={id} name={field.name} required={field.required} defaultValue={defaultValue ?? ""}>
          {!field.required && <option value="" />}
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
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

  return (
    <form action={formAction} className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-wider uppercase">
          {editingId ? (
            <>Editando <span className="font-marker text-guajillo normal-case">la orden</span></>
          ) : (
            <>Nuevo <span className="font-marker text-guajillo normal-case">marchantitx</span></>
          )}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="rounded-lg px-2 py-1 text-lg leading-none font-extrabold text-carbon/50 transition hover:bg-carbon/5 hover:text-carbon"
        >
          ×
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <FormField key={field.name} field={field} record={record} />
        ))}
      </div>
      {state?.error && <p role="alert" className="mt-4 rounded-xl border border-guajillo/30 bg-guajillo/10 px-3 py-2 text-sm font-semibold text-guajillo">{state.error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl border-2 border-black bg-guajillo px-5 py-2.5 text-xs font-extrabold tracking-wider text-white uppercase shadow-[3px_3px_0_0_#000] transition duration-150 hover:-translate-y-0.5 hover:bg-guajillo-oscuro active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          {pending ? "Guardando..." : "Guardar"}
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
        className="rounded-lg px-2.5 py-1 text-xs font-extrabold tracking-wide text-guajillo uppercase transition hover:bg-guajillo/10"
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
}) {
  const [mode, setMode] = useState<null | "new" | string>(null);
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
        method="get"
        onSubmit={(e) => {
          const input = e.currentTarget.elements.namedItem("search") as HTMLInputElement | null;
          if (input && !input.value.trim()) input.removeAttribute("name");
        }}
        className="flex gap-2"
      >
        {sort && <input type="hidden" name="sort" value={sort} />}
        {sort && order && <input type="hidden" name="order" value={order} />}
        {Object.entries(extraParams ?? {}).map(
          ([key, value]) => value && <input key={key} type="hidden" name={key} value={value} />,
        )}
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Buscar…"
          className="max-w-sm"
        />
        <button
          type="submit"
          className="rounded-xl border-2 border-carbon/20 bg-white px-4 py-2 text-xs font-extrabold tracking-wider uppercase transition hover:border-carbon/60"
        >
          Buscar
        </button>
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
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-carbon text-white">
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
                                {active && <span aria-hidden>{order === "desc" ? "▼" : "▲"}</span>}
                              </Link>
                            ) : (
                              col.label
                            )}
                          </th>
                        );
                      })}
                      <th className="px-4 py-3 text-[11px] font-extrabold tracking-wider uppercase">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, i) => (
                      <tr
                        key={String(record.id)}
                        className={`border-b border-carbon/8 transition last:border-0 hover:bg-mostaza-tinta/60 ${editingId === String(record.id) ? "bg-mostaza-tinta" : i % 2 === 1 ? "bg-carbon/[0.02]" : "bg-white"}`}
                      >
                        {columns.map((col) => (
                          <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle" title={String(get(record, col.key) ?? "")}>
                            <CellValue value={get(record, col.key)} />
                          </td>
                        ))}
                        <td className="px-4 py-2 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setMode(String(record.id))}
                              className="rounded-lg px-2.5 py-1 text-xs font-extrabold tracking-wide text-pizarra-oscuro uppercase transition hover:bg-pizarra/15"
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
              {total === 0 ? "0 registros" : `${from}–${to} de ${total}`}
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
