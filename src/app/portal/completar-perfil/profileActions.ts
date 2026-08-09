"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const schema = z.object({
  company_name: z.string().min(2, "La empresa es obligatoria").max(200),
  contact_name: z.string().min(2, "El nombre de contacto es obligatorio").max(200),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
});

export type CompleteProfileResult = { ok: true } | { ok: false; error: string };

export async function completeProfile(formData: FormData): Promise<CompleteProfileResult> {
  const parsed = schema.safeParse({
    company_name: formData.get("company_name"),
    contact_name: formData.get("contact_name"),
    phone: formData.get("phone") || undefined,
    location: formData.get("location") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return { ok: false, error: firstError };
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "Debe iniciar sesión." };
  }

  const { company_name, contact_name, phone, location } = parsed.data;

  const { error: updateError } = await supabase
    .from("customers")
    .update({
      company_name,
      contact_name,
      phone: phone || null,
      location: location || null,
      profile_completed: true,
    })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, error: "No se pudo guardar el perfil. Intenta de nuevo." };
  }

  revalidatePath("/portal");
  return { ok: true };
}
