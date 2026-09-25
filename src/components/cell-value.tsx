// Sin "use client": son funciones puras, así record-list.tsx (Server
// Component) las usa sin arrastrar el módulo cliente de resource-table.

export const ES_LABELS: Record<string, string> = {
  validated: "Validado",
  billable: "Facturable",
  invoiced: "Facturado",
  rejected: "Rechazado",
  draft: "Borrador",
  sending: "Enviando",
  issued: "Emitida",
  error: "Error",
  cancelled: "Cancelada",
  new: "Nuevo",
  assigned: "Asignado",
  in_progress: "En progreso",
  resolved: "Resuelto",
  closed: "Cerrado",
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
  preferida: "Preferida",
  activo: "Activo",
  inactivo: "Inactivo",
};

export function labelEs(value: unknown): string {
  const str = String(value ?? "");
  return ES_LABELS[str.toLowerCase()] ?? str.replace(/_/g, " ");
}

export function toneFor(value: unknown): string {
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

export function CellValue({ value }: { value: unknown }) {
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
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${toneFor(str)}`}>
        {labelEs(str)}
      </span>
    );
  return <span className="tabular">{str}</span>;
}
