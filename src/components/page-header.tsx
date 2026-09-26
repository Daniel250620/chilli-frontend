import type { ReactNode } from "react";

export function PageHeader({
  title,
  accent,
  description,
  action,
}: {
  title: string;
  accent: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-carbon uppercase sm:text-[1.7rem]">
          {title}{" "}
          <span className="font-marker text-guajillo normal-case">{accent}</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-carbon/60">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function ListError({ message, retryHref }: { message: string; retryHref?: string }) {
  return (
    <div role="alert" className="elevacion flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-guajillo/30 bg-guajillo/10 px-4 py-3">
      <p className="text-sm font-semibold text-guajillo">{message}</p>
      {retryHref && (
        <a href={retryHref} className="text-xs font-extrabold tracking-wider uppercase text-guajillo hover:underline">
          Reintentar
        </a>
      )}
    </div>
  );
}
