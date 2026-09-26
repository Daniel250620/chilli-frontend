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

export function CellValue({ value, fieldKey }: { value: unknown; fieldKey?: string }) {
  if (typeof value === "boolean")
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${toneFor(value ? "sí" : "no")}`}>
        {value ? "Sí" : "No"}
      </span>
    );
  if (value == null || value === "") return <span className="text-carbon/30">—</span>;
  // ponytail: formato de fechas/montos relativos por forma del valor + pista
  // de la columna, sin añadir props de formato a Column.
  const key = (fieldKey ?? "").toLowerCase();
  const moneyValue =
    typeof value === "number" && (key.includes("total") || key.includes("monto"))
      ? value
      : key.includes("total") && !Number.isNaN(Number(String(value)))
        ? Number(String(value))
        : null;
  if (moneyValue !== null && String(value).trim() !== "") {
    let formatted: string | null = null;
    try {
      formatted = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(moneyValue);
    } catch {
      formatted = null;
    }
    if (formatted !== null) return <span className="tabular">{formatted}</span>;
  }
  const str = String(value);
  const isoDate = /^\d{4}-\d{2}-\d{2}(T|\s|$)/.test(str);
  if (isoDate) {
    const d = new Date(str);
    if (!Number.isNaN(d.getTime())) {
      const dateFmt = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" });
      const hasTime = /T\d{2}:\d{2}/.test(str) && !(d.getHours() === 0 && d.getMinutes() === 0);
      const formatted = hasTime
        ? `${dateFmt.format(d)}, ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
        : dateFmt.format(d);
      if (key.includes("sla") || key.includes("due")) {
        // eslint-disable-next-line react-hooks/purity -- relativo al día actual; el Server Component se revalida por request.
        const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
        const relative = days < 0 ? `vencido hace ${Math.abs(days)} d` : days === 0 ? "vence hoy" : `vence en ${days} d`;
        // ponytail: el riesgo se ve distinto al dato neutro; el texto ya
        // distingue, el pill solo acelera el escaneo (mismos tonos de toneFor).
        const pill =
          days <= 0
            ? `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${days < 0 ? "border-guajillo/30 bg-guajillo/10 text-guajillo" : "border-mostaza-claro bg-mostaza-tinta text-nota"}`
            : undefined;
        return (
          <span className="tabular" title={formatted}>
            {pill ? <span className={pill}>{relative}</span> : relative}{" "}
            <span className="text-carbon/45">· {formatted}</span>
          </span>
        );
      }
      return <span className="tabular">{formatted}</span>;
    }
  }
  if (/^(validated|billable|invoiced|rejected|draft|sending|issued|error|cancelled|new|assigned|in_progress|resolved|closed|low|medium|high|critical)$/i.test(str))
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${toneFor(str)}`}>
        {labelEs(str)}
      </span>
    );
  return <span className="tabular">{str}</span>;
}
