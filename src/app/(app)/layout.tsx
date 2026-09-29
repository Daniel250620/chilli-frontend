import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/logout-button";
import { MobileNav, SideNav } from "@/components/side-nav";

const NAV_LINKS = [
  { href: "/customer", label: "Clientes", hint: "Marchantitx registrados" },
  { href: "/ticket", label: "Tickets", hint: "Lo que se vendió en POS" },
  { href: "/invoice", label: "Facturas", hint: "Tickets ya facturados" },
  { href: "/csf", label: "CSF", hint: "Constancias fiscales" },
  { href: "/branch", label: "Sucursales", hint: "Tiendas físicas" },
  { href: "/case", label: "Casos", hint: "Soporte y seguimiento" },
  { href: "/chat", label: "Chat", hint: "Mockup de conversaciones (ejemplo)" },
  { href: "/cfdi-demo", label: "Timbrar", hint: "Demo de CFDI (pruebas)" },
  { href: "/user", label: "Usuarios", hint: "Usuarios del panel" },
] as const;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const initial =
    session.user.name?.trim()?.charAt(0) ?? session.user.email.charAt(0);

  return (
    <div className="fondo-fonda-suave flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-carbon text-white md:flex">
        <div className="fondo-fonda border-b-2 border-black px-5 pt-5 pb-4">
          <Link
            href="/customer"
            className="block"
            aria-label="Chili Guajili · inicio"
          >
            <Image
              src="/logo-cg.png"
              alt="Chili Guajili"
              width={180}
              height={61}
              priority
              className="h-auto w-[180px] drop-shadow-[1.5px_1.5px_0_#000]"
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SideNav links={NAV_LINKS} />
        </div>

        <div className="border-t border-white/15 p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-black bg-mostaza text-sm font-extrabold text-nota uppercase shadow-[2px_2px_0_0_rgba(255,255,255,0.25)]"
            >
              {initial.toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {[session.user.name, session.user.lastName]
                  .filter(Boolean)
                  .join(" ") ?? "Marchante"}
              </p>
              <p className="truncate text-xs font-medium text-white/70">
                {session.user.email}
              </p>
              {(session.user.rol || session.user.branch?.name) && (
                <p className="truncate text-[10px] font-extrabold tracking-[0.16em] text-mostaza-claro/90 uppercase">
                  {[session.user.rol, session.user.branch?.name]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton user={session.user} />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar móvil */}
        <header className="fondo-fonda sticky top-0 z-10 border-b-2 border-black px-4 pt-3 pb-2 md:hidden">
          <Image
            src="/logo-cg.png"
            alt="Chili Guajili"
            width={140}
            height={48}
            className="h-auto w-[140px] drop-shadow-[1px_1px_0_#000]"
          />
          <MobileNav links={NAV_LINKS} />
        </header>

        <main className="w-full flex-1 px-4 py-6 sm:px-6 md:py-8">
          {children}
        </main>

        <footer className="px-6 pb-6">
          <p className="text-center text-[11px] font-bold tracking-[0.16em] text-carbon/40 uppercase">
            Hecho con chile guajillo · Powered by Karimnot
          </p>
        </footer>
      </div>
    </div>
  );
}
