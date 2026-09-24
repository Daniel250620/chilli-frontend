// Mockup estático — sin estado, sin backend, sin WhatsApp API real.
// Solo para mostrar cómo se vería la sección de chat. No funcional.

type Contact = {
  name: string;
  initials: string;
  color: string;
  time: string;
  preview: string;
  unread?: number;
  outgoing?: boolean;
  online?: boolean;
  active?: boolean;
};

type Bubble = { fromMe: boolean; text: string; time: string; read?: boolean };

const CONTACTS: Contact[] = [
  { name: "Rosa Martínez", initials: "RM", color: "bg-guajillo", time: "12:41", preview: "¿A qué hora abren hoy?", unread: 2, online: true, active: true },
  { name: "Javier Ortega", initials: "JO", color: "bg-pizarra", time: "11:58", preview: "Perfecto, ahí lo recojo", outgoing: true },
  { name: "Sucursal Centro", initials: "SC", color: "bg-mostaza", time: "10:20", preview: "Ticket #4521 validado ✅", unread: 1 },
  { name: "Lupita Cano", initials: "LC", color: "bg-guajillo-oscuro", time: "Ayer", preview: "Gracias, buen provecho 🌶️" },
  { name: "David Pérez", initials: "DP", color: "bg-pizarra-oscuro", time: "Ayer", preview: "Va, quedamos así entonces", outgoing: true },
];

const THREAD: Bubble[] = [
  { fromMe: false, text: "Buenas, ¿a qué hora abren hoy?", time: "12:38" },
  { fromMe: true, text: "¡Buenas Rosa! Abrimos a la 1:00pm 🌶️", time: "12:39", read: true },
  { fromMe: false, text: "¿Tienen servicio a domicilio en la colonia Centro?", time: "12:40" },
  { fromMe: true, text: "Sí, cubrimos esa zona. En cuanto abramos te paso el link para tu pedido.", time: "12:41", read: true },
  { fromMe: false, text: "¿A qué hora abren hoy?", time: "12:41" },
];

function Avatar({ initials, color, online }: { initials: string; color: string; online?: boolean }) {
  return (
    <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center">
      <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white ${color}`}>
        {initials}
      </span>
      {online && (
        <span aria-hidden className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
}

function CheckIcon({ double }: { double?: boolean }) {
  return (
    <svg viewBox="0 0 16 11" width="15" height="11" className="inline-block">
      <path d="M1 5.5 4.5 9 10 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {double && (
        <path d="M6 5.5 9.5 9 15 2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="elevacion flex h-[calc(100vh-6rem)] min-h-[640px] overflow-hidden rounded-2xl border border-carbon/10 bg-white">
        {/* Lista de contactos */}
        <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-carbon/10">
          <div className="flex items-center justify-between border-b border-carbon/10 px-4 py-3">
            <h2 className="text-sm font-extrabold tracking-wide text-carbon uppercase">Mensajes</h2>
            <span className="rounded-full bg-guajillo/10 px-2 py-0.5 text-[11px] font-extrabold text-guajillo">
              {CONTACTS.reduce((n, c) => n + (c.unread ?? 0), 0)}
            </span>
          </div>

          <div className="border-b border-carbon/10 px-3 py-2">
            <input
              type="text"
              placeholder="Buscar conversación…"
              disabled
              className="!cursor-not-allowed !bg-tiza/60"
            />
          </div>

          <ul className="flex-1 overflow-y-auto">
            {CONTACTS.map((c) => (
              <li key={c.name}>
                <div
                  className={[
                    "flex items-start gap-3 border-b border-carbon/5 px-4 py-3",
                    c.active ? "bg-mostaza-tinta" : "hover:bg-crema",
                  ].join(" ")}
                >
                  <Avatar initials={c.initials} color={c.color} online={c.online} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-carbon">{c.name}</p>
                      <span className="shrink-0 text-[11px] font-semibold text-carbon/45">{c.time}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="flex min-w-0 items-center gap-1 truncate text-xs text-carbon/60">
                        {c.outgoing && <span className="text-pizarra"><CheckIcon double /></span>}
                        <span className="truncate">{c.preview}</span>
                      </p>
                      {!!c.unread && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-guajillo px-1 text-[11px] font-extrabold text-white">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Hilo de conversación */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-carbon/10 px-4 py-3">
            <Avatar initials="RM" color="bg-guajillo" online />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-carbon">Rosa Martínez</p>
              <p className="text-xs text-emerald-600">en línea</p>
            </div>
          </header>

          <div className="fondo-fonda-suave flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-col gap-2">
              {THREAD.map((m, i) => (
                <div key={i} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "max-w-[75%] px-3.5 py-2 text-sm shadow-sm",
                      m.fromMe
                        ? "rounded-2xl rounded-tr-sm bg-carbon text-white"
                        : "rounded-2xl rounded-tl-sm border border-carbon/10 bg-white text-carbon",
                    ].join(" ")}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <p
                      className={[
                        "mt-1 flex items-center justify-end gap-1 text-[10px]",
                        m.fromMe ? "text-white/60" : "text-carbon/40",
                      ].join(" ")}
                    >
                      {m.time}
                      {m.fromMe && <CheckIcon double={m.read} />}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-carbon/10 px-4 py-3">
            <div className="flex items-center gap-2 rounded-full border border-carbon/15 bg-tiza px-3 py-1.5">
              <button type="button" disabled aria-label="Adjuntar" className="!cursor-not-allowed p-1 text-carbon/40">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M21 12.5 12.5 21a5 5 0 0 1-7-7L14 5.5a3.5 3.5 0 0 1 5 5L10.5 19a2 2 0 0 1-3-3L15 8.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Escribe un mensaje… (ejemplo, no envía nada)"
                disabled
                className="!cursor-not-allowed !border-none !bg-transparent !px-1 !shadow-none"
              />
              <button type="button" disabled aria-label="Enviar" className="!cursor-not-allowed rounded-full bg-guajillo/40 p-2 text-white">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
                  <path d="M3 20.5v-17l19 8.5-19 8.5Zm2-2.7L17.5 12 5 6.2v4.9l7.4.9-7.4.9v4.9Z" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
