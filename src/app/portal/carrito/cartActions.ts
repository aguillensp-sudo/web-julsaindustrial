"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Server actions del carrito de la compra.
 *
 * El carrito vive en public.cart_items (una fila por cliente y producto) y se
 * convierte en UN pedido con varias líneas al finalizar. Antes no existía
 * carrito: la ficha de producto creaba un pedido por artículo.
 *
 * Todas las acciones validan sesión; RLS garantiza además que un cliente solo
 * toca su propio carrito.
 */
const addSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1").max(9999),
});

const quantitySchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "La cantidad mínima es 1").max(9999),
});

export type CartActionResult = { ok: true } | { ok: false; error: string };

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Añade un producto al carrito; si ya estaba, suma la cantidad. */
export async function addToCart(formData: FormData): Promise<CartActionResult> {
  const parsed = addSchema.safeParse({
    product_id: formData.get("product_id"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { product_id, quantity } = parsed.data;
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  const { data: product } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", product_id)
    .eq("is_active", true)
    .maybeSingle();
  if (!product) return { ok: false, error: "Producto no encontrado." };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("customer_id", user.id)
    .eq("product_id", product_id)
    .maybeSingle();

  const newQuantity = (existing?.quantity ?? 0) + quantity;
  if (product.stock < newQuantity)
    return { ok: false, error: "No hay stock suficiente." };

  const { error } = existing
    ? await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existing.id)
    : await supabase
        .from("cart_items")
        .insert({ customer_id: user.id, product_id, quantity });

  if (error) return { ok: false, error: "No se pudo añadir al carrito." };

  revalidatePath("/portal/carrito");
  revalidatePath("/portal/catalogo");
  return { ok: true };
}

/** Fija la cantidad de una línea del carrito. */
export async function setCartQuantity(
  formData: FormData,
): Promise<CartActionResult> {
  const parsed = quantitySchema.safeParse({
    product_id: formData.get("product_id"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

  const { product_id, quantity } = parsed.data;
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  const { data: product } = await supabase
    .from("products")
    .select("stock")
    .eq("id", product_id)
    .maybeSingle();
  if (product && product.stock < quantity)
    return { ok: false, error: "No hay stock suficiente." };

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("customer_id", user.id)
    .eq("product_id", product_id);
  if (error) return { ok: false, error: "No se pudo actualizar la cantidad." };

  revalidatePath("/portal/carrito");
  return { ok: true };
}

/** Elimina una línea del carrito. */
export async function removeFromCart(
  formData: FormData,
): Promise<CartActionResult> {
  const productId = String(formData.get("product_id") ?? "");
  if (!z.string().uuid().safeParse(productId).success)
    return { ok: false, error: "Producto no indicado." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("customer_id", user.id)
    .eq("product_id", productId);
  if (error) return { ok: false, error: "No se pudo quitar el producto." };

  revalidatePath("/portal/carrito");
  return { ok: true };
}

/**
 * Convierte el carrito en un pedido: un solo `orders` con tantas líneas como
 * productos tenga el carrito. El precio unitario y el total los fija la base
 * de datos (triggers de 0004), no el cliente.
 */
export async function checkout(formData: FormData): Promise<CheckoutResult> {
  const notesParsed = z.string().max(2000).optional().safeParse(
    (formData.get("notes") as string | null) ?? undefined,
  );
  if (!notesParsed.success)
    return { ok: false, error: "Las observaciones son demasiado largas." };

  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Debe iniciar sesión." };

  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price_usd, stock, is_active)")
    .eq("customer_id", user.id);

  if (!items || items.length === 0)
    return { ok: false, error: "Su carrito está vacío." };

  // Validar disponibilidad de todas las líneas antes de crear nada.
  for (const item of items) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    if (!product || !product.is_active)
      return {
        ok: false,
        error: "Un producto del carrito ya no está disponible. Revíselo.",
      };
    if (product.stock < item.quantity)
      return {
        ok: false,
        error: `No hay stock suficiente de ${product.name}.`,
      };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "in_payment",
      notes: notesParsed.data ?? null,
    })
    .select("id")
    .single();
  if (orderError || !order)
    return { ok: false, error: "No se pudo crear el pedido." };

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
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

  // Pedido realizado: el carrito se vacía.
  await supabase.from("cart_items").delete().eq("customer_id", user.id);

  revalidatePath("/portal/carrito");
  revalidatePath("/portal/mis-pedidos");
  revalidatePath("/portal");
  return { ok: true, orderId: order.id };
}
