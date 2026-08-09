"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export type SetStatusResult = { ok: true } | { ok: false; error: string };

const customerIdSchema = z.string().uuid();
const statusSchema = z.enum(["active", "suspended"]);

export async function setCustomerStatus(
  customerId: string,
  status: "active" | "suspended",
): Promise<SetStatusResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const customerIdValidation = customerIdSchema.safeParse(customerId);
  if (!customerIdValidation.success) {
    return { ok: false, error: "ID de cliente inválido." };
  }

  const statusValidation = statusSchema.safeParse(status);
  if (!statusValidation.success) {
    return { ok: false, error: "Estado inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customers")
    .update({ status: statusValidation.data })
    .eq("id", customerIdValidation.data);

  if (error) {
    return { ok: false, error: "No se pudo actualizar el estado del cliente." };
  }

  revalidatePath("/admin/clientes");
  return { ok: true };
}
