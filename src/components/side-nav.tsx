"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { href: string; label: string; hint: string };

export function SideNav({ links }: { links: readonly NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones de la fonda" className="flex flex-col gap-1">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            title={link.hint}
            className={[
              "group flex items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold tracking-wide uppercase transition duration-150",
              active
                ? "bg-mostaza text-nota shadow-[3px_3px_0_0_#000]"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            ].join(" ")}
          >
            <span>{link.label}</span>
            <span
              aria-hidden
              className={[
                "h-2 w-2 rounded-full transition",
                active ? "bg-guajillo" : "bg-white/20 group-hover:bg-mostaza-claro",
              ].join(" ")}
            />
          </Link>
        );
      })}
    </nav>
  );
}
