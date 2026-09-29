"use client";

import { useEffect, useState, useTransition } from "react";
import { Selector } from "@/components/selector";
import { cfdiStatus, listCfdiUses, stampCfdi, type Receptor, type StampResult } from "@/lib/actions/cfdi-demo";
import { CsfDropzone } from "./csf-dropzone";

type Concepto = { descripcion: string; cantidad: number; unitario: number };

const POLL_MS = 3000;
const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const input =
  "mt-1 w-full rounded-xl border-[1.5px] border-carbon/28 bg-white px-3 py-[0.55rem] text-sm text-carbon focus:border-guajillo focus:ring-[3px] focus:ring-guajillo/18 focus:outline-none";
const label = "text-[11px] font-bold text-carbon/50 uppercase";
const btn =
  "rounded-xl border-2 border-black px-4 py-2 text-sm font-extrabold tracking-wide uppercase shadow-[3px_3px_0_0_#000] transition active:translate-x-px active:translate-y-px active:shadow-none disabled:cursor-not-allowed disabled:opacity-50";

export function StampDemo({ receptor, conceptos }: { receptor: Receptor; conceptos: Concepto[] }) {
  const [form, setForm] = useState<Receptor>(receptor);
  const [uses, setUses] = useState<{ value: string; label: string }[]>([]);
  const [result, setResult] = useState<StampResult | null>(null);
  const [stamped, setStamped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const total = conceptos.reduce((s, c) => s + c.cantidad * c.unitario, 0);
  const uuid = result?.uuid;

  // Espera el webhook: consulta el estado hasta que pase a "stamped".
  useEffect(() => {
    if (!uuid || stamped) return;
    const id = setInterval(async () => {
      if ((await cfdiStatus(uuid)) === "stamped") setStamped(true);
    }, POLL_MS);
    return () => clearInterval(id);
  }, [uuid, stamped]);

  const rfc = form.rfc.trim().toUpperCase();
  const canQuery = /^[A-ZÑ&0-9]{12,13}$/.test(rfc) && /^\d{3}$/.test(form.regimen);

  // Usos válidos para el RFC y régimen actuales; descarta respuestas obsoletas.
  useEffect(() => {
    if (!canQuery) return;
    let cancelled = false;
    listCfdiUses(rfc, form.regimen).then((list) => {
      if (cancelled) return;
      const options = list.map((u) => ({ value: u.id, label: `${u.id} · ${u.descripcion}` }));
      setUses(options);
      setForm((f) => (options.some((o) => o.value === f.uso) ? f : { ...f, uso: "" }));
    });
    return () => {
      cancelled = true;
    };
  }, [canQuery, rfc, form.regimen]);

  const set = (k: keyof Receptor) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function stamp() {
    if (!form.uso) {
      setError("Elige el uso de CFDI.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const { data, error } = await stampCfdi({ ...form, rfc });
      if (error) setError(error);
      else if (data) setResult(data);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="elevacion rounded-2xl border-2 border-black bg-tiza p-4">
        <h2 className="text-xs font-extrabold tracking-[0.2em] text-carbon/60 uppercase">Receptor</h2>
        <div className="mt-2">
          <CsfDropzone
            onExtracted={(d) =>
              setForm({
                rfc: d.rfc,
                nombre: d.socialReason,
                cp: d.postalCode,
                regimen: d.taxRegimes[0] ?? "",
                uso: "",
              })
            }
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={label}>RFC</span>
            <input className={input} value={form.rfc} onChange={set("rfc")} maxLength={13} />
          </label>
          <label className="block">
            <span className={label}>Nombre / razón social</span>
            <input className={input} value={form.nombre} onChange={set("nombre")} />
          </label>
          <label className="block">
            <span className={label}>Código postal</span>
            <input className={input} value={form.cp} onChange={set("cp")} maxLength={5} inputMode="numeric" />
          </label>
          <label className="block">
            <span className={label}>Régimen fiscal</span>
            {/* ponytail: input de 3 dígitos (demo con CSF de un solo régimen); endpoint de regímenes + Selector cuando el bot permita elegir */}
            <input className={input} value={form.regimen} onChange={set("regimen")} maxLength={3} inputMode="numeric" />
          </label>
          <div className="sm:col-span-2">
            <span className={label}>Uso de CFDI</span>
            <Selector
              key={form.uso}
              name="uso"
              ariaLabel="Uso de CFDI"
              options={canQuery ? uses : []}
              placeholder="Elige el uso de CFDI"
              defaultValue={form.uso}
              onChange={(uso) => setForm((f) => ({ ...f, uso }))}
              className="mt-1 w-full"
            />
          </div>
        </div>
      </section>

      <section className="elevacion overflow-x-auto rounded-2xl border-2 border-black bg-tiza p-4">
        <h2 className="text-xs font-extrabold tracking-[0.2em] text-carbon/60 uppercase">Conceptos</h2>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold text-carbon/50 uppercase">
              <th className="py-1">Descripción</th>
              <th className="py-1 text-right">Cant.</th>
              <th className="py-1 text-right">P. unitario</th>
              <th className="py-1 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {conceptos.map((c) => (
              <tr key={c.descripcion} className="border-t border-carbon/10 font-medium">
                <td className="py-1.5">{c.descripcion}</td>
                <td className="py-1.5 text-right">{c.cantidad}</td>
                <td className="py-1.5 text-right">{mxn.format(c.unitario)}</td>
                <td className="py-1.5 text-right">{mxn.format(c.cantidad * c.unitario)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-black font-extrabold">
              <td colSpan={3} className="py-2 text-right uppercase">Total (IVA incluido)</td>
              <td className="py-2 text-right">{mxn.format(total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {error && (
        <p role="alert" className="rounded-2xl border border-guajillo/30 bg-guajillo/10 px-4 py-3 text-sm font-semibold text-guajillo">
          {error}
        </p>
      )}

      {!result ? (
        <div>
          <button onClick={stamp} disabled={pending} className={`${btn} bg-mostaza text-nota`}>
            {pending ? "Timbrando…" : "Timbrar"}
          </button>
        </div>
      ) : (
        <section className="elevacion flex flex-col gap-3 rounded-2xl border-2 border-black bg-mostaza-tinta p-4">
          <p className="text-sm font-semibold text-carbon">
            Timbrado <span className="font-mono">{result.serie}-{result.folio}</span> · UUID{" "}
            <span className="font-mono break-all">{result.uuid}</span>
          </p>
          {stamped ? (
            <div className="flex flex-wrap gap-3">
              <a href={`/cfdi-demo/${result.uuid}/pdf`} className={`${btn} bg-guajillo text-white`}>Descargar PDF</a>
              <a href={`/cfdi-demo/${result.uuid}/xml`} className={`${btn} bg-pizarra text-white`}>Descargar XML</a>
            </div>
          ) : (
            <p className="text-sm font-medium text-carbon/70" aria-live="polite">
              Esperando confirmación del webhook…
            </p>
          )}
        </section>
      )}
    </div>
  );
}
