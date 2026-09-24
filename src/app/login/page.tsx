import Image from "next/image";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="fondo-fonda flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center">
        <Image
          src="/logo-cg.png"
          alt="Chili Guajili"
          width={280}
          height={95}
          priority
          className="h-auto w-[280px] max-w-[80vw] drop-shadow-[2px_2px_0_#000]"
        />

        <div className="sticker mt-6 w-full rounded-2xl bg-tiza p-6 sm:p-8">
          <h1 className="text-center text-lg font-extrabold tracking-wide text-carbon uppercase">
            Marchantitx, pasa a la caja
          </h1>
          <p className="mt-1 text-center text-sm font-semibold text-carbon/60">
            Da clic, entra y sigue facturando
          </p>
          <div className="mt-5">
            <LoginForm />
          </div>
        </div>

        <p className="mt-5 text-center text-xs font-bold tracking-wide text-nota uppercase">
          A partir de la 1:00pm · From 1:00pm
        </p>
      </div>
    </div>
  );
}
