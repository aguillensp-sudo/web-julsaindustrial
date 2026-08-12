import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { CartLine } from "./CartLine";

export const metadata: Metadata = {
  title: "Carrito",
};

export const dynamic = "force-dynamic";

type CartProduct = {
  name: string;
  unit: string;
  price_usd: number;
  stock: number;
  is_active: boolean;
};

export default async function CarritoPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, unit, price_usd, stock, is_active)")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: true });

  const items = (rows ?? []).map((row) => {
    const product = (Array.isArray(row.products) ? row.products[0] : row.products) as
      | CartProduct
      | undefined;
    return {
      productId: row.product_id,
      quantity: row.quantity,
      name: product?.name ?? "Producto no disponible",
      unit: product?.unit ?? "",
      price: Number(product?.price_usd ?? 0),
      stock: product?.stock ?? 0,
      available: Boolean(product?.is_active),
    };
  });

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const blocked = items.some((i) => !i.available || i.stock < i.quantity);

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Carrito</h1>
      <p className="text-sm mt-1 text-[var(--text)]/70">
        Añada todos los artículos que necesite: al finalizar se generará un
        único pedido con todas las líneas.
      </p>

      {items.length === 0 ? (
        <p className="text-[15px] mt-6">
          Su carrito está vacío.{" "}
          <Link href="/portal/catalogo" className="no-underline">
            Ir a la tienda →
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--text)]/70">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3 text-right">Precio</th>
                  <th className="p-3">Cantidad</th>
                  <th className="p-3 text-right">Subtotal</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <CartLine key={item.productId} item={item} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[var(--border)]">
                  <td className="p-3 font-bold" colSpan={3}>
                    Total
                  </td>
                  <td className="p-3 text-right font-extrabold text-[var(--accent-deep)]">
                    USD {total.toFixed(2)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <Link href="/portal/catalogo" className="text-[15px] no-underline">
              ← Seguir comprando
            </Link>
            {blocked ? (
              <p className="text-sm text-red-700" role="alert">
                Hay líneas sin disponibilidad. Ajuste la cantidad o quite el
                producto para poder finalizar el pedido.
              </p>
            ) : (
              <Link
                href="/portal/checkout"
                className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 no-underline"
              >
                Finalizar pedido →
              </Link>
            )}
          </div>
        </>
      )}
    </PortalShell>
  );
}
