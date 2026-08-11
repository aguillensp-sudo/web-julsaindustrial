import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUS_LABEL } from "@/lib/db/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

type OrderWithCustomer = {
  id: string;
  status: keyof typeof ORDER_STATUS_LABEL;
  total_usd: number;
  created_at: string;
  customers: { company_name: string; contact_name: string } | { company_name: string; contact_name: string }[] | null;
};

export default async function AdminPedidosPage() {
  const supabase = createAdminClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, total_usd, created_at, customers(company_name, contact_name)")
    .order("created_at", { ascending: false });

  // Comprobantes subidos por los clientes, para señalar en el listado qué
  // pedidos ya traen adjunto sin tener que entrar al detalle.
  const { data: proofs } = await supabase
    .from("payment_proofs")
    .select("order_id");
  const withProof = new Set((proofs ?? []).map((p) => p.order_id));

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
        <Card>
          <p className="text-red-700 text-sm">No se pudieron cargar los pedidos.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      {!orders || orders.length === 0 ? (
        <Card>
          <p className="text-gray-500">Todavía no hay pedidos.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {(orders as OrderWithCustomer[]).map((order) => {
            const customer = Array.isArray(order.customers)
              ? order.customers[0]
              : order.customers;

            return (
              <Card key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{customer?.company_name ?? "Cliente desconocido"}</p>
                    <p className="text-sm text-gray-500">{customer?.contact_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(order.created_at).toLocaleDateString("es-ES")}
                    </p>
                    <p className="font-semibold">USD {Number(order.total_usd).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "ready_for_delivery"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      withProof.has(order.id) ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {withProof.has(order.id)
                      ? "Comprobante adjunto ✓"
                      : "Sin comprobante"}
                  </span>
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver detalle
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
