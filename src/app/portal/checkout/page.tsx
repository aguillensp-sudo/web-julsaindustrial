import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = {
  title: "Finalizar pedido",
};

export const dynamic = "force-dynamic";

type CartProduct = { name: string; price_usd: number };

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price_usd)")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: true });

  const items = (rows ?? []).map((row) => {
    const product = (Array.isArray(row.products) ? row.products[0] : row.products) as
      | CartProduct
      | undefined;
    const price = Number(product?.price_usd ?? 0);
    return {
      name: product?.name ?? "Producto",
      quantity: row.quantity,
      lineTotal: price * row.quantity,
    };
  });
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Finalizar pedido</h1>
      {items.length === 0 ? (
        <p className="text-[15px] mt-6">
          Su carrito está vacío.{" "}
          <Link href="/portal/catalogo" className="no-underline">
            Ir a la tienda →
          </Link>
        </p>
      ) : (
        <CheckoutForm items={items} total={total} />
      )}
    </PortalShell>
  );
}
