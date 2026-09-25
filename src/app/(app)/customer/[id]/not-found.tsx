import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 py-16 text-center">
      <p className="font-marker text-2xl text-guajillo">No encontramos a este marchantitx</p>
      <Link href="/customer" className="text-xs font-extrabold tracking-wider uppercase text-carbon/55 hover:underline">
        ← Clientes
      </Link>
    </div>
  );
}
