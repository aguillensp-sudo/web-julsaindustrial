import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "./PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABEL } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export default async function PortalHome() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");
  if (!customer.profile_completed) redirect("/portal/completar-perfil");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, total_usd, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <PortalShell>
      <p className="text-sm text-[var(--text)]/70">
        Hola, <strong>{customer.company_name}</strong>
      </p>
      <h1 className="text-2xl font-bold mt-1">Mi área personal</h1>

      <div className="grid gap-4 sm:grid-cols-2 mt-6">
        <Link
          href="/portal/catalogo"
          className="no-underline bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-5 hover:border-[var(--accent)]"
        >
          <h2 className="font-bold text-lg text-[var(--text)]">Tienda</h2>
          <p className="text-sm mt-1">Ver productos y realizar pedidos.</p>
        </Link>
        <Link
          href="/portal/mis-pedidos"
          className="no-underline bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-5 hover:border-[var(--accent)]"
        >
          <h2 className="font-bold text-lg text-[var(--text)]">Mis pedidos</h2>
          <p className="text-sm mt-1">Historial y estado de sus pedidos.</p>
        </Link>
      </div>

      <h2 className="font-bold text-lg mt-8 mb-3">Pedidos recientes</h2>
      {orders && orders.length > 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--text)]/70">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="p-3">#{o.id.slice(0, 8)}</td>
                  <td className="p-3">
                    {new Date(o.created_at).toLocaleDateString("es-ES")}
                  </td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-right">USD {Number(o.total_usd).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-[var(--text)]/70">
          Aún no tiene pedidos.{" "}
          <Link href="/portal/catalogo" className="no-underline">
            Haga su primer pedido →
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
