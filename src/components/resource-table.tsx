"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveRecord, deleteRecord, type ActionState } from "@/lib/actions/resource";
import { get, type Resource, type Column, type Field } from "@/lib/resources";

const initialState: ActionState = {};

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
  onCancel,
}: {
  resource: Resource;
  fields: readonly Field[];
  editingId: string | null;
  record: Record<string, unknown> | null;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveRecord.bind(null, resource, editingId, fields),
    initialState,
  );

  return (
    <form key={editingId ?? "new"} action={formAction} className="elevacion rounded-2xl border border-carbon/10 bg-tiza p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-wider uppercase">
          {editingId ? (
            <>Editando <span className="font-marker text-guajillo normal-case">la orden</span></>
          ) : (
            <>Nuevo <span className="font-marker text-guajillo normal-case">marchantitx</span></>
          )}
        </h2>
        {editingId && (
          <span className="rounded-full border border-mostaza-claro bg-mostaza-tinta px-2.5 py-1 text-[11px] font-bold text-nota">
            Editando…
          </span>
        )}
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
        {editingId && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-carbon/20 bg-white px-5 py-2.5 text-xs font-extrabold tracking-wider text-carbon uppercase transition duration-150 hover:border-carbon/50"
          >
            Cancelar edición
          </button>
        )}
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

export function ResourceTable({
  resource,
  records,
  total,
  offset,
  limit,
  columns,
  fields,
}: {
  resource: Resource;
  records: Record<string, unknown>[];
  total: number;
  offset: number;
  limit: number;
  columns: readonly Column[];
  fields: readonly Field[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingRecord = records.find((r) => r.id === editingId) ?? null;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  return (
    <div className="flex flex-col gap-5">
      <div className="elevacion overflow-hidden rounded-2xl border border-carbon/10 bg-tiza">
        {records.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <p className="font-marker text-2xl text-guajillo">Nada por aquí…</p>
            <p className="mt-2 max-w-sm text-sm font-medium text-carbon/60">
              Marchantitx, aún no hay registros. Usa el formulario de abajo para dar de alta el primero.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-carbon text-white">
                  {columns.map((col) => (
                    <th key={col.key} scope="col" className="px-4 py-3 text-[11px] font-extrabold tracking-wider whitespace-nowrap uppercase">
                      {col.label}
                    </th>
                  ))}
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
                          onClick={() => setEditingId(String(record.id))}
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
              href={`?offset=${Math.max(0, offset - limit)}`}
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
              href={`?offset=${offset + limit}`}
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

      <RecordForm
        resource={resource}
        fields={fields}
        editingId={editingId}
        record={editingRecord}
        onCancel={() => setEditingId(null)}
      />
    </div>
  );
}
