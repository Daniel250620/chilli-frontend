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
  viewAllHref,
  error,
}: {
  title: string;
  columns: readonly Column[];
  records: Record<string, unknown>[];
  total: number;
  emptyMessage: string;
  viewAllHref?: string;
  error?: string;
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
        <ListError message={error} />
      ) : records.length === 0 ? (
        <div className="elevacion flex flex-col items-center rounded-2xl border border-carbon/10 bg-tiza px-6 py-10 text-center">
          <p className="font-marker text-xl text-guajillo">{emptyMessage}</p>
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
                </tr>
              </thead>
              <tbody>
                {records.map((record, i) => (
                  <tr
                    key={String(record.id)}
                    className={`border-b border-carbon/8 last:border-0 ${i % 2 === 1 ? "bg-carbon/[0.02]" : "bg-white"}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="max-w-56 truncate px-4 py-3 align-middle" title={String(get(record, col.key) ?? "")}>
                        <CellValue value={get(record, col.key)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
