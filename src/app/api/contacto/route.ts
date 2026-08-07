import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Route handler del formulario de contacto público.
 * Validación server-side obligatoria (Perfil B). El envío real (email/CRM) se
 * cablea con credenciales en Hito 4; por ahora valida y confirma recepción.
 *
 * Anti-spam: honeypot "company" — si llega relleno, responde 200 sin enviar
 * (no revela al bot que fue detectado).
 */
const schema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(120),
  phone: z.string().max(40).optional().or(z.literal("")),
  email: z.string().email("Email inválido").max(160),
  message: z.string().min(5, "Mensaje demasiado corto").max(4000),
  company: z.string().optional(), // honeypot
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = Object.fromEntries(await request.formData());
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // Honeypot: si el bot rellenó el campo oculto, fingir éxito sin enviar.
  if (parsed.data.company?.trim()) {
    return NextResponse.json({ ok: true });
  }

  // TODO (Hito 4): enviar email / registrar en CRM con credenciales seguras.
  // Mientras tanto, devolvemos confirmación.
  return NextResponse.json({ ok: true });
}
