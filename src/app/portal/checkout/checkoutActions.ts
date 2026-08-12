"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createOrderCheckoutSession } from "@/lib/stripe";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(9999),
      }),
    )
    .min(1, "El carrito está vacío"),
  paymentMethod: z.enum(["bank_transfer", "stripe", "tropipay"]),
  notes: z.string().max(2000).optional(),
});

export type CheckoutInput = z.infer<typeof schema>;

export type CheckoutResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function createOrderFromCart(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const { items, paymentMethod, notes } = parsed.data;

  // TropiPay aún no está disponible; el radio ya viene deshabilitado en la UI,
  // esto es defensa en profundidad para no dejar pedidos huérfanos.
  if (paymentMethod === "tropipay") {
    return { ok: false, error: "TropiPay aún no está disponible." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  // Re-lee productos vigentes: nunca confiar en precios/stock del carrito local.
  const productIds = items.map((i) => i.productId);
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price_usd, stock")
    .in("id", productIds)
    .eq("is_active", true);

  if (productsError || !products || products.length !== productIds.length) {
    return { ok: false, error: "Uno o más productos ya no están disponibles." };
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  for (const item of items) {
    const product = productById.get(item.productId);
    if (!product) return { ok: false, error: "Producto no encontrado." };
    if (product.stock < item.quantity) {
      return { ok: false, error: `No hay stock suficiente de "${product.name}".` };
    }
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

  if (orderError || !order) {
    return { ok: false, error: "No se pudo crear el pedido." };
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price_usd: productById.get(item.productId)!.price_usd,
    })),
  );

  if (itemsError) {
    return { ok: false, error: "No se pudieron añadir los productos al pedido." };
  }

  if (paymentMethod === "bank_transfer") {
    return { ok: true, redirectTo: "/portal/mis-pedidos" };
  }

  // paymentMethod === "stripe"
  const origin = (await headers()).get("origin") ?? "";
  try {
    const session = await createOrderCheckoutSession({
      orderId: order.id,
      lineItems: items.map((item) => ({
        name: productById.get(item.productId)!.name,
        unitAmountCents: Math.round(Number(productById.get(item.productId)!.price_usd) * 100),
        quantity: item.quantity,
      })),
      successUrl: `${origin}/portal/checkout/success?order_id=${order.id}`,
      cancelUrl: `${origin}/portal/checkout?cancelled=1`,
      email: user.email,
    });

    if (!session.url) {
      return { ok: false, error: "Stripe no devolvió una URL de pago." };
    }
    return { ok: true, redirectTo: session.url };
  } catch (err) {
    console.error("Error creating Stripe checkout session:", err);
    return { ok: false, error: "No se pudo iniciar el pago con tarjeta." };
  }
}
