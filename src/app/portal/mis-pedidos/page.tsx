import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  type PaymentMethod,
  type PaymentStatus,
} from "@/lib/db/types";
import { ProofUpload } from "./ProofUpload";
import { ProofView } from "./ProofView";
import { PayNowButton } from "./PayNowButton";

export const dynamic = "force-dynamic";

export default async function MisPedidosPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, payment_method, payment_status, total_usd, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false });

  // Comprobante ya adjuntado por pedido (uno como máximo). Se muestra siempre
  // para que el cliente pueda verlo y, si se equivocó, sustituirlo.
  const orderIds = (orders ?? []).map((o) => o.id);
  const { data: proofs } = orderIds.length
    ? await supabase
        .from("payment_proofs")
        .select("order_id, file_path, uploaded_at")
        .in("order_id", orderIds)
        .order("uploaded_at", { ascending: false })
    : { data: [] as { order_id: string; file_path: string; uploaded_at: string }[] };

  const proofByOrder = new Map<string, { file_path: string; uploaded_at: string }>();
  for (const p of proofs ?? []) {
    if (!proofByOrder.has(p.order_id))
      proofByOrder.set(p.order_id, {
        file_path: p.file_path,
        uploaded_at: p.uploaded_at,
      });
  }

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Mis pedidos</h1>
      <p className="text-sm mt-1 text-[var(--text)]/70">
        En los pedidos pagados por transferencia, suba el comprobante: Julsa lo
        revisará y marcará el pedido como disponible para entrega.
      </p>

      {orders && orders.length > 0 ? (
        <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[var(--text)]/70">
              <tr>
                <th className="p-3">Pedido</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Pago</th>
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
                  <td className="p-3 text-xs">
                    <span className="block">
                      {PAYMENT_METHOD_LABEL[o.payment_method as PaymentMethod] ??
                        "Transferencia"}
                    </span>
                    <span
                      className={
                        o.payment_status === "paid"
                          ? "text-green-700 font-semibold"
                          : o.payment_status === "pending"
                            ? "text-amber-700 font-semibold"
                            : "text-red-700 font-semibold"
                      }
                    >
                      {PAYMENT_STATUS_LABEL[o.payment_status as PaymentStatus] ??
                        "Pago pendiente"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    USD {Number(o.total_usd).toFixed(2)}
                  </td>
                  <td className="p-3">
                    {o.payment_method === "stripe" ? (
                      o.payment_status === "paid" ? (
                        <span className="text-xs text-green-700">
                          Pagado con tarjeta ✓
                        </span>
                      ) : (
                        <PayNowButton orderId={o.id} />
                      )
                    ) : o.status === "ready_for_delivery" ? (
                      <div className="space-y-1">
                        <span className="block text-xs text-green-700">
                          Pago verificado ✓
                        </span>
                        {proofByOrder.get(o.id) && (
                          <ProofView proof={proofByOrder.get(o.id)!} />
                        )}
                      </div>
                    ) : (
                      <ProofUpload
                        orderId={o.id}
                        existing={proofByOrder.get(o.id) ?? null}
                      />
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
