"use client";

import { useState } from "react";
import { extractTicket } from "@/lib/actions/cfdi-demo";
import { Dropzone } from "./dropzone";

export function TicketDemo() {
  const [folio, setFolio] = useState<string | null>(null);

  return (
    <section className="elevacion rounded-2xl border-2 border-black bg-tiza p-4">
      <h2 className="text-xs font-extrabold tracking-[0.2em] text-carbon/60 uppercase">Folio de ticket</h2>
      <div className="mt-2">
        <Dropzone
          action={extractTicket}
          label="Suelta aquí la foto del ticket o haz clic para elegirla"
          pendingLabel="Leyendo ticket…"
          onExtracted={(d) => setFolio(d.folio)}
        />
      </div>
      {folio && <p className="mt-3 font-mono text-lg font-bold text-carbon">{folio}</p>}
    </section>
  );
}
