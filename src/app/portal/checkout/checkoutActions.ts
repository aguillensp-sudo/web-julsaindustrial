"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOrderCheckoutSession } from "@/lib/stripe";

/**
 * Convierte el carrito del cliente (tabla cart_items) en UN pedido con tantas
 * líneas como productos, y arranca el cobro según el método elegido.
 *
 * El carrito vive en la base de datos, no en el navegador: aquí se relee
 * siempre desde Supabase, junto con el precio y el stock vigentes. Nada de lo
 * que envía el cliente influye en el importe.
 */
const schema = z.object({
  paymentMethod: z.enum(["bank_transfer", "stripe", "tropipay"]),
  notes: z.string().max(2000).optional(),
});

export type CheckoutResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

type CartProduct = {
  name: string;
  price_usd: number;
  stock: number;
  is_active: boolean;
};

export async function createOrderFromCart(
  formData: FormData,
): Promise<CheckoutResult> {
  const parsed = schema.safeParse({
    paymentMethod: formData.get("paymentMethod"),
    notes: (formData.get("notes") as string | null) || undefined,
  });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { paymentMethod, notes } = parsed.data;

  // TropiPay aún no está disponible; el radio ya viene deshabilitado en la UI,
  // esto es defensa en profundidad para no dejar pedidos huérfanos.
  if (paymentMethod === "tropipay")
    return { ok: false, error: "TropiPay aún no está disponible." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  const { data: cart } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price_usd, stock, is_active)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: true });

  if (!cart || cart.length === 0)
    return { ok: false, error: "Su carrito está vacío." };

  const lines = cart.map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
    product: (Array.isArray(row.products) ? row.products[0] : row.products) as
      | CartProduct
      | undefined,
  }));

  for (const line of lines) {
    if (!line.product || !line.product.is_active)
      return {
        ok: false,
        error: "Un producto del carrito ya no está disponible. Revíselo.",
      };
    if (line.product.stock < line.quantity)
      return {
        ok: false,
        error: `No hay stock suficiente de ${line.product.name}.`,
      };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "in_payment",
      payment_method: paymentMethod,
      payment_status: "pending",
      notes: notes ?? null,
    })
    .select("id")
    .single();
  if (orderError || !order)
    return { ok: false, error: "No se pudo crear el pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.productId,
      quantity: line.quantity,
      // La DB sobrescribe el precio con el vigente (trigger de 0004).
      unit_price_usd: 0,
    })),
  );
  if (itemsError) {
    // Sin líneas el pedido no tiene sentido: se deshace para no dejar
    // pedidos vacíos en "Mis pedidos".
    await supabase.from("orders").delete().eq("id", order.id);
    return { ok: false, error: "No se pudieron añadir los productos al pedido." };
  }

  // Pedido creado: el carrito se vacía.
  await supabase.from("cart_items").delete().eq("customer_id", user.id);

  revalidatePath("/portal/carrito");
  revalidatePath("/portal/mis-pedidos");
  revalidatePath("/portal");

  if (paymentMethod === "bank_transfer")
    return { ok: true, redirectTo: "/portal/mis-pedidos" };

  // paymentMethod === "stripe"
  const origin = (await headers()).get("origin") ?? "";
  try {
    const session = await createOrderCheckoutSession({
      orderId: order.id,
      lineItems: lines.map((line) => ({
        name: line.product!.name,
        unitAmountCents: Math.round(Number(line.product!.price_usd) * 100),
        quantity: line.quantity,
      })),
      successUrl: `${origin}/portal/checkout/success?order_id=${order.id}`,
      cancelUrl: `${origin}/portal/mis-pedidos?pago=cancelado`,
      email: user.email,
    });

    if (!session.url)
      return { ok: false, error: "Stripe no devolvió una URL de pago." };
    return { ok: true, redirectTo: session.url };
  } catch (err) {
    console.error("Error creating Stripe checkout session:", err);
    // El pedido queda creado y pendiente de pago: el cliente puede reintentar
    // el cobro desde "Mis pedidos" sin perder la compra.
    return {
      ok: false,
      error:
        "El pedido se creó, pero no se pudo iniciar el pago con tarjeta. Reinténtelo desde Mis pedidos.",
    };
  }
}
