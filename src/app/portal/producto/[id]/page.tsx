import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("id, line, name, description, price_usd, unit, stock")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return (
      <PortalShell>
        <p>Producto no encontrado.</p>
        <Link href="/portal/catalogo" className="no-underline">
          ← Volver al catálogo
        </Link>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <Link href="/portal/catalogo" className="text-sm no-underline">
        ← Catálogo
      </Link>
      <div className="grid gap-6 md:grid-cols-2 mt-4">
        <div className="aspect-square rounded bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--border)]">
          <span className="text-sm">{product.name}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-2">{product.description}</p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-sm">
              {product.stock > 0 ? (
                <span className="text-green-700 font-semibold">
                  En stock ({product.stock} {product.unit})
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Sin stock</span>
              )}
            </span>
            <span className="text-2xl font-extrabold text-[var(--accent-deep)]">
              USD {Number(product.price_usd).toFixed(2)}
            </span>
          </div>
          <hr className="my-5 border-[var(--border)]" />
          <h2 className="font-bold mb-2">Hacer pedido</h2>
          <OrderForm productId={product.id} />
        </div>
      </div>
    </PortalShell>
  );
}
