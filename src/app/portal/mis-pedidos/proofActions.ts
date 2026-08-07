"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action: subir comprobante de pago a un pedido.
 * - Valida sesión y propiedad del pedido.
 * - Valida tipo (PDF/JPG/PNG) y tamaño (≤5MB).
 * - Sube a bucket privado payment-proofs y registra en payment_proofs.
 * fase2-define-spec §4 (comprobantes validados).
 */
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export type UploadProofResult =
  | { ok: true }
  | { ok: false; error: string };

export async function uploadProof(
  formData: FormData,
): Promise<UploadProofResult> {
  const orderId = String(formData.get("order_id") ?? "");
  const file = formData.get("file") as File | null;

  if (!orderId) return { ok: false, error: "Pedido no indicado." };
  if (!file || file.size === 0)
    return { ok: false, error: "Seleccione un archivo." };
  if (file.size > MAX_BYTES)
    return { ok: false, error: "El archivo supera los 5 MB." };

  // Validar MIME: priorizar el tipo declarado por el navegador; el backend de
  // Storage también rechazará si configuramos tipos permitidos en el bucket.
  if (!ALLOWED.includes(file.type))
    return { ok: false, error: "Solo PDF, JPG o PNG." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  // Verificar propiedad del pedido (RLS también lo protege).
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("customer_id", user.id)
    .maybeSingle();
  if (!order) return { ok: false, error: "Pedido no encontrado." };

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${orderId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("payment-proofs")
    .upload(path, file, { upsert: false });
  if (upErr) return { ok: false, error: "No se pudo subir el archivo." };

  const { error: dbErr } = await supabase
    .from("payment_proofs")
    .insert({ order_id: orderId, file_path: path });
  if (dbErr) return { ok: false, error: "No se pudo registrar el comprobante." };

  revalidatePath("/portal/mis-pedidos");
  return { ok: true };
}
