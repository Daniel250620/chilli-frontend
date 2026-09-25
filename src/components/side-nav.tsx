"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string; hint: string };

export function SideNav({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();
  const operacion = links.slice(0, 4);
  const gestion = links.slice(4);

  return (
    <nav aria-label="Secciones de Chili Guajili" className="flex flex-col gap-5">
      <NavGroup
        label="Operación"
        links={operacion}
        pathname={pathname}
      />
      <div aria-hidden className="mx-1 flex items-center gap-2">
        <span className="h-px flex-1 bg-white/15" />
        <svg
          width="48"
          height="6"
          viewBox="0 0 48 6"
          fill="none"
          className="shrink-0 opacity-40"
        >
          <path
            d="M1 4 Q 6 1, 11 3.5 T 21 3.5 T 31 3.5 T 41 3.5 T 51 3.5"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="h-px flex-1 bg-white/15" />
      </div>
      <NavGroup label="Gestión" links={gestion} pathname={pathname} />
    </nav>
  );
}

function NavGroup({
  label,
  links,
  pathname,
}: {
  label: string;
  links: readonly NavLink[];
  pathname: string;
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[10px] font-extrabold tracking-[0.22em] text-white/60 uppercase">
        {label}
      </p>
      <ul className="flex flex-col gap-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex flex-col gap-0.5 rounded-xl border-2 px-3 py-2 transition duration-150",
                  active
                    ? "-rotate-[0.5deg] border-black bg-mostaza text-nota shadow-[3px_3px_0_0_#000]"
                    : "border-transparent text-white/75 hover:border-white/10 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <span
                  className={
                    active
                      ? "font-marker text-[15px] leading-tight"
                      : "text-[13px] font-bold tracking-wide uppercase"
                  }
                >
                  {link.label}
                </span>
                <span
                  className={[
                    "text-[11px] leading-tight font-medium normal-case tracking-normal",
                    active ? "text-nota/70" : "text-white/60",
                  ].join(" ")}
                >
                  {link.hint}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="mt-2 flex gap-2 overflow-x-auto pb-2">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={[
              "shrink-0 rounded-full border-2 px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase transition",
              active
                ? "border-black bg-mostaza text-nota shadow-[2px_2px_0_0_#000]"
                : "border-black/70 bg-tiza text-carbon hover:bg-mostaza-claro",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
