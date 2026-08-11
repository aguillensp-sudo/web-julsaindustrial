"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server actions de comprobantes de pago del cliente.
 *
 * uploadProof:
 * - Valida sesión y propiedad del pedido.
 * - Valida tipo (PDF/JPG/PNG) y tamaño (≤5MB).
 * - Sube a bucket privado payment-proofs y registra en payment_proofs.
 * - Solo se admite UN comprobante por pedido: al subir uno nuevo se elimina
 *   el anterior (fichero + fila), de modo que el cliente puede corregir un
 *   adjunto equivocado sin dejar rastros duplicados.
 *
 * getMyProofSignedUrl: enlace temporal para que el cliente vea el
 * comprobante que ya tiene adjuntado.
 *
 * fase2-define-spec §4 (comprobantes validados).
 */
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];

export type UploadProofResult =
  | { ok: true }
  | { ok: false; error: string };

export type ProofUrlResult =
  | { ok: true; url: string }
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

  // Comprobantes previos de este pedido (para sustituirlos tras subir el nuevo).
  const { data: previous } = await supabase
    .from("payment_proofs")
    .select("id, file_path")
    .eq("order_id", orderId);

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

  // Un único comprobante por pedido: borrar los anteriores. Se usa el cliente
  // de servicio porque el borrado no está abierto al rol authenticated; la
  // propiedad del pedido ya se ha verificado arriba.
  if (previous && previous.length > 0) {
    const admin = createAdminClient();
    await admin.storage
      .from("payment-proofs")
      .remove(previous.map((p) => p.file_path));
    await admin
      .from("payment_proofs")
      .delete()
      .in(
        "id",
        previous.map((p) => p.id),
      );
  }

  revalidatePath("/portal/mis-pedidos");
  return { ok: true };
}

export async function getMyProofSignedUrl(
  filePath: string,
): Promise<ProofUrlResult> {
  if (!filePath.trim()) return { ok: false, error: "Ruta no válida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  // El comprobante debe pertenecer a un pedido del usuario (RLS lo verifica,
  // pero comprobamos también el prefijo de carpeta antes de firmar la URL).
  if (!filePath.startsWith(`${user.id}/`))
    return { ok: false, error: "No autorizado." };

  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(filePath, 300);

  if (error || !data?.signedUrl)
    return { ok: false, error: "No se pudo abrir el comprobante." };

  return { ok: true, url: data.signedUrl };
}
