"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action: crear pedido de una línea (producto + cantidad).
 * - Valida sesión y estado del cliente (defensa en profundidad; el middleware
 *   ya bloquea /portal sin sesión).
 * - Valida input con zod.
 * - Crea orders (status in_payment) + order_items con snapshot de precio.
 * design.md §Flows.
 */
const schema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1").max(9999),
  notes: z.string().max(2000).optional(),
});

export type CreateOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(
  formData: FormData,
): Promise<CreateOrderResult> {
  const parsed = schema.safeParse({
    product_id: formData.get("product_id"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { product_id, quantity, notes } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  // Producto vigente (precio y stock snapshot).
  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("id, price_usd, stock")
    .eq("id", product_id)
    .maybeSingle();
  if (pErr || !product)
    return { ok: false, error: "Producto no encontrado." };
  if (product.stock < quantity)
    return { ok: false, error: "No hay stock suficiente." };

  const lineTotal = Number(product.price_usd) * quantity;

  // Crear pedido.
  const { data: order, error: oErr } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "in_payment",
      total_usd: lineTotal,
      notes: notes ?? null,
    })
    .select("id")
    .single();
  if (oErr || !order)
    return { ok: false, error: "No se pudo crear el pedido." };

  // Línea de pedido con snapshot de precio.
  const { error: iErr } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    quantity,
    unit_price_usd: product.price_usd,
  });
  if (iErr) return { ok: false, error: "No se pudo añadir el producto al pedido." };

  revalidatePath("/portal/mis-pedidos");
  return { ok: true, orderId: order.id };
}
