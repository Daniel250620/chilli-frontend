export function PageHeader({
  title,
  accent,
  description,
  total,
}: {
  title: string;
  accent: string;
  description: string;
  total?: number;
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
      {typeof total === "number" && (
        <p className="rounded-full border border-carbon/15 bg-tiza px-3 py-1 text-xs font-extrabold tracking-wide text-carbon/70 uppercase">
          <span className="tabular">{total}</span> registros
        </p>
      )}
    </div>
  );
}

export function ListError({ message }: { message: string }) {
  return (
    <p role="alert" className="elevacion rounded-2xl border border-guajillo/30 bg-guajillo/10 px-4 py-3 text-sm font-semibold text-guajillo">
      {message}
    </p>
  );
}
