"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Alta de cliente desde el servidor.
 *
 * El auto-registro con `supabase.auth.signUp` depende del envío del email de
 * confirmación, y el servicio de correo integrado de Supabase está limitado a
 * unos pocos envíos por hora: en producción devolvía
 * `over_email_send_rate_limit` y el alta fallaba pese a ser correctos los datos.
 *
 * Aquí se crea el usuario con la service role y `email_confirm: true`, que no
 * envía correo ni está sujeto a ese límite. El trigger handle_new_user crea la
 * fila en `customers` con razón social, contacto, teléfono y ubicación.
 *
 * IMPORTANTE: al no haber correo de confirmación, el email no queda verificado.
 * Cuando se configure SMTP propio conviene volver a exigir verificación.
 */
const schema = z.object({
  company_name: z.string().trim().min(1, "La razón social es obligatoria."),
  contact_name: z.string().trim().min(1, "La persona de contacto es obligatoria."),
  email: z.string().trim().email("Introduzca un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  phone: z.string().trim().max(50).optional(),
  location: z.string().trim().max(200).optional(),
});

export type RegisterResult = { ok: true } | { ok: false; error: string };

export async function registerCustomer(
  formData: FormData,
): Promise<RegisterResult> {
  const parsed = schema.safeParse({
    company_name: formData.get("company_name"),
    contact_name: formData.get("contact_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? undefined,
    location: formData.get("location") ?? undefined,
  });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const { company_name, contact_name, email, password, phone, location } =
    parsed.data;

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      company_name,
      contact_name,
      phone: phone ?? "",
      location: location ?? "",
    },
  });

  if (error) {
    const message = error.message ?? "";
    if (
      message.includes("already been registered") ||
      message.includes("already registered") ||
      message.includes("already exists")
    ) {
      return { ok: false, error: "Ya existe una cuenta con ese email." };
    }
    if (message.toLowerCase().includes("password")) {
      return { ok: false, error: "La contraseña no cumple los requisitos." };
    }
    console.error("Error creando la cuenta de cliente:", error);
    return { ok: false, error: "No se pudo crear la cuenta. Inténtelo de nuevo." };
  }

  return { ok: true };
}
