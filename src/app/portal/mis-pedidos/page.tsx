import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABEL } from "@/lib/db/types";
import { ProofUpload } from "./ProofUpload";

export const dynamic = "force-dynamic";

export default async function MisPedidosPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_usd, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="text-sm mt-1 text-[var(--text)]/70">
        Suba el comprobante de pago de cada pedido. Julsa lo revisará y lo
        marcará como disponible para entrega.
      </p>

      {orders && orders.length > 0 ? (
        <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--text)]/70">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)] align-top">
                  <td className="p-3">#{o.id.slice(0, 8)}</td>
                  <td className="p-3">
                    {new Date(o.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-right">
                    USD {Number(o.total_usd).toFixed(2)}
                  </td>
                  <td className="p-3">
                    {o.status === "ready_for_delivery" ? (
                      <span className="text-xs text-green-700">
                        Pago verificado ✓
                      </span>
                    ) : (
                      <ProofUpload orderId={o.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--text)]/70 mt-6">
          No tiene pedidos todavía.{" "}
          <Link href="/portal/catalogo" className="no-underline">
            Ver catálogo →
          </Link>
        </p>
      )}
    </PortalShell>
  );
}

function StatusBadge({ status }: { status: keyof typeof ORDER_STATUS_LABEL }) {
  const color =
    status === "ready_for_delivery"
      ? "bg-green-100 text-green-800"
      : "bg-amber-100 text-amber-800";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${color}`}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
