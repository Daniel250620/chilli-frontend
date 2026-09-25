export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="h-4 w-24 animate-pulse rounded bg-carbon/5" />
      <div className="h-9 w-64 animate-pulse rounded bg-carbon/5" />
      <div className="h-40 animate-pulse rounded-2xl bg-carbon/5" />
      <div className="h-52 animate-pulse rounded-2xl bg-carbon/5" />
      <div className="h-52 animate-pulse rounded-2xl bg-carbon/5" />
    </div>
  );
}
