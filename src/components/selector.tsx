"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

// Selector personalizado (no <select> nativo): el menú de un <select> lo
// pinta el SO fuera del árbol de la página, así que en algunas
// combinaciones de navegador/SO no aparece al compartir pantalla en
// videollamada. Este dropdown se pinta como DOM normal (mismo patrón que
// AutocompleteField en resource-table.tsx), así siempre es visible.
// El valor viaja en un <input type="hidden"> con el mismo `name`, por lo que
// saveRecord/FormData no necesitan saber que el campo no es un <select> real.
export function Selector({
  id,
  name,
  options,
  placeholder,
  defaultValue,
  onChange,
  required,
  className,
  ariaLabel,
}: {
  id?: string;
  name: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  // ponytail: un <input type="hidden"> no participa en la validación nativa
  // del <form>, así que `required` ya no bloquea el submit como con <select>.
  // El backend sigue validando (mismo trato que AutocompleteField, que nunca
  // tuvo bloqueo nativo); si hace falta feedback antes del submit, agregarlo.
  required?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  function choose(next: string) {
    setValue(next);
    setOpen(false);
    onChange?.(next);
  }

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} required={required} />
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 rounded-xl border-[1.5px] border-carbon/28 bg-white px-3 py-[0.55rem] text-left text-sm text-carbon transition hover:border-carbon/50 focus:border-guajillo focus:ring-[3px] focus:ring-guajillo/18 focus:outline-none ${className ?? ""}`}
      >
        <span className={selected ? "" : "text-carbon/42"}>{selected?.label ?? placeholder}</span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`shrink-0 text-guajillo transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" className="elevacion absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-carbon/15 bg-white py-1 text-sm">
          {placeholder !== undefined && (
            <li role="option" aria-selected={value === ""}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-carbon/60 hover:bg-mostaza-tinta/60"
                onClick={() => choose("")}
              >
                {placeholder}
              </button>
            </li>
          )}
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left hover:bg-mostaza-tinta/60 ${option.value === value ? "bg-mostaza-tinta font-semibold" : ""}`}
                onClick={() => choose(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
