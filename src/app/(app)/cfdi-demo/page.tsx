import { PageHeader } from "@/components/page-header";
import { StampDemo } from "./stamp-demo";

// Valores iniciales del formulario: Público en General, para poder timbrar sin subir nada.
const RECEPTOR = {
  rfc: "XAXX010101000",
  nombre: "PÚBLICO EN GENERAL",
  cp: "",
  regimen: "616",
  uso: "S01",
};
const CONCEPTOS = [
  { descripcion: "Tlayuda oaxaqueña", cantidad: 1, unitario: 180 },
  { descripcion: "Agüita de jamaica", cantidad: 2, unitario: 40 },
];

export default function CfdiDemoPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <PageHeader
        title="Timbrar"
        accent="CFDI de prueba"
        description="Demo contra el ambiente de pruebas: sube la constancia del receptor o captura sus datos, elige el uso de CFDI y timbra; descarga los archivos cuando llegue el webhook."
      />
      <StampDemo receptor={RECEPTOR} conceptos={CONCEPTOS} />
    </div>
  );
}
