// Server Component: tabla de solo lectura para las sub-secciones del
// detalle de cliente (tickets, casos). Sin paginación/búsqueda/orden — para
// eso está "Ver todos →". No reusa ResourceTable: ver design.md.

import Link from "next/link";
import { get, type Column } from "@/lib/resources";
import { CellValue } from "@/components/cell-value";
import { ListError } from "@/components/page-header";

export function RecordList({
  title,
  columns,
  records,
  total,
  emptyMessage,
  emptyHint,
  viewAllHref,
  error,
  retryHref,
  getRowHref,
  rowNoun,
}: {
  title: string;
  columns: readonly Column[];
  records: Record<string, unknown>[];
  total: number;
  emptyMessage: string;
  emptyHint?: string;
  viewAllHref?: string;
  error?: string;
  retryHref?: string;
  getRowHref?: (record: Record<string, unknown>) => string | undefined;
  rowNoun?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-extrabold tracking-wider uppercase">
          {title} <span className="text-carbon/50">· {total}</span>
        </h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-extrabold tracking-wider uppercase text-carbon/55 hover:underline">
            Ver todos →
          </Link>
        )}
      </div>

      {error ? (
        <ListError message={error} retryHref={retryHref} />
      ) : records.length === 0 ? (
        <div className="elevacion flex flex-col items-center rounded-2xl border border-carbon/10 bg-tiza px-6 py-10 text-center">
          <p className="font-marker text-xl text-guajillo">{emptyMessage}</p>
          {emptyHint && <p className="mt-2 max-w-sm text-sm font-medium text-carbon/60">{emptyHint}</p>}
          {viewAllHref && (
            <Link href={viewAllHref} className="mt-3 text-xs font-extrabold tracking-wider uppercase text-carbon/55 hover:underline">
              {rowNoun === "ticket" ? "Ir a tickets →" : rowNoun === "caso" ? "Ir a casos →" : "Ver todos →"}
            </Link>
          )}
        </div>
      ) : (
        <div className="elevacion overflow-hidden rounded-2xl border border-carbon/10 bg-tiza">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-carbon/10 bg-[#faf6ec] text-carbon">
                  {columns.map((col) => (
                    <th key={col.key} scope="col" className="px-4 py-3 text-[11px] font-extrabold tracking-wider whitespace-nowrap uppercase">
                      {col.label}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3 text-right text-[11px] font-extrabold tracking-wider uppercase">
                    Ver
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => {
                  const rowHref = getRowHref?.(record);
                  return (
                  <tr
                    key={String(record.id ?? i)}
                    className={`border-b border-carbon/8 last:border-0 ${i % 2 === 1 ? "bg-carbon/[0.02]" : "bg-white"}`}
                  >
                    {columns.map((col, colIndex) => {
                      // ponytail: la factura vive en ticket.invoice (puede ser
                      // null); el riesgo (facturable sin factura) se ve
                      // distinto al dato neutro, con texto además de color.
                      if (col.key === "invoice.status") {
                        const invoice = record.invoice as Record<string, unknown> | null | undefined;
                        const status = get(record, col.key);
                        const ticketStatus = String(get(record, "status") ?? "");
                        if (!invoice || status == null || status === "") {
                          return (
                            <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle">
                              {ticketStatus === "billable" ? (
                                <span className="inline-flex items-center rounded-full border border-guajillo/30 bg-guajillo/10 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-guajillo">
                                  Sin factura · facturable
                                </span>
                              ) : (
                                <span className="text-carbon/30">Sin factura</span>
                              )}
                            </td>
                          );
                        }
                        const ticketKey = String(get(record, "externalTicketId") ?? (invoice as Record<string, unknown>).id ?? "");
                        const invoiceHref = ticketKey ? `/invoice?search=${encodeURIComponent(ticketKey)}` : undefined;
                        const pill = <CellValue value={status} fieldKey={col.key} />;
                        return (
                          <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle" title={String(status)}>
                            {invoiceHref ? (
                              <Link href={invoiceHref} title="Ver factura" aria-label={`Ver factura del ticket ${ticketKey}`} className="hover:opacity-80">
                                {pill}
                              </Link>
                            ) : (
                              pill
                            )}
                          </td>
                        );
                      }
                      const value = get(record, col.key);
                      const cell = <CellValue value={value} fieldKey={col.key} />;
                      return (
                        <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle" title={String(value ?? "")}>
                          {colIndex === 0 && rowHref ? (
                            <Link href={rowHref} className="font-semibold underline decoration-carbon/30 underline-offset-2 hover:decoration-carbon">
                              {cell}
                            </Link>
                          ) : (
                            cell
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 align-middle text-right whitespace-nowrap">
                      {rowHref ? (
                        <Link
                          href={rowHref}
                          aria-label={rowNoun ? `Ver ${rowNoun} ${String(get(record, columns[0]?.key ?? "id") ?? "")}` : "Ver registro"}
                          className="text-xs font-extrabold tracking-wider uppercase text-carbon/55 hover:underline"
                        >
                          {rowNoun ? `Ver ${rowNoun}` : "Ver"} →
                        </Link>
                      ) : (
                        <span className="text-carbon/30">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
