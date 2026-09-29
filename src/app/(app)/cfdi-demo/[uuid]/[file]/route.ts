import { httpClient, authHeaders } from "@/lib/http-client";

// Puente de descarga: el JWT vive en una cookie httpOnly, así que el
// navegador no puede llamar al backend directo.
const TYPES = { pdf: "application/pdf", xml: "application/xml" } as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ uuid: string; file: string }> },
) {
  const { uuid, file } = await params;
  if (file !== "pdf" && file !== "xml") return new Response("No encontrado", { status: 404 });

  try {
    const res = await httpClient.get(`/cfdi-demo/${encodeURIComponent(uuid)}/${file}`, {
      headers: await authHeaders(),
      responseType: "arraybuffer",
    });
    return new Response(res.data, {
      headers: {
        "Content-Type": TYPES[file],
        "Content-Disposition": `attachment; filename="factura-${uuid}.${file}"`,
      },
    });
  } catch {
    return new Response("Archivo no disponible", { status: 502 });
  }
}
