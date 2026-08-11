"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };

export async function getProofSignedUrl(filePath: string): Promise<SignedUrlResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  if (!filePath.trim()) {
    return { ok: false, error: "Ruta de fichero inválida." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(filePath, 300);

  if (error || !data?.signedUrl) {
    return { ok: false, error: "No se pudo generar el enlace del comprobante." };
  }

  return { ok: true, url: data.signedUrl };
}

export type MarkReadyResult = { ok: true } | { ok: false; error: string };

export async function markReadyForDelivery(orderId: string): Promise<MarkReadyResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const parsed = z.string().uuid().safeParse(orderId);
  if (!parsed.success) {
    return { ok: false, error: "ID de pedido inválido." };
  }

  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status, payment_method, payment_status")
    .eq("id", parsed.data)
    .maybeSingle();

  if (fetchError || !order) {
    return { ok: false, error: "No se pudo encontrar el pedido." };
  }

  if (order.status === "ready_for_delivery") {
    return { ok: false, error: "El pedido ya está marcado como disponible para entrega." };
  }

  if (order.status !== "in_payment") {
    return { ok: false, error: "No se puede cambiar el estado del pedido." };
  }

  // Al aprobar un pedido pagado por transferencia (revisión del comprobante),
  // este mismo clic salda también el pago; los pagados con tarjeta ya llegan
  // con payment_status='paid' vía webhook de Stripe y no se tocan aquí.
  const updates: { status: "ready_for_delivery"; payment_status?: "paid" } = {
    status: "ready_for_delivery",
  };
  if (order.payment_method === "bank_transfer" && order.payment_status === "pending") {
    updates.payment_status = "paid";
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", parsed.data);

  if (updateError) {
    return { ok: false, error: "No se pudo actualizar el estado del pedido." };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${parsed.data}`);

  return { ok: true };
}
