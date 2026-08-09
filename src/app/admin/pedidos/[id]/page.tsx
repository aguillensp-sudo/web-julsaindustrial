import { Card } from "@/components/ui/Card";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_STATUS_LABEL } from "@/lib/db/types";
import Link from "next/link";
import { ProofViewer } from "./ProofViewer";
import { MarkReadyButton } from "./MarkReadyButton";

export const dynamic = "force-dynamic";

type CustomerDetail = {
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
};

type OrderDetail = {
  id: string;
  customer_id: string;
  status: keyof typeof ORDER_STATUS_LABEL;
  total_usd: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customers: CustomerDetail | CustomerDetail[] | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price_usd: number;
  line_total_usd: number;
  products: { name: string; unit: string | null } | { name: string; unit: string | null }[] | null;
};

type PaymentProof = {
  id: string;
  file_path: string;
  uploaded_at: string;
};

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, customers(company_name, contact_name, phone, location)")
    .eq("id", id)
    .maybeSingle();

  if (orderError || !order) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Pedido no encontrado</h1>
        <Link href="/admin/pedidos" className="text-blue-600 hover:underline">
          ← Volver a pedidos
        </Link>
      </div>
    );
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, quantity, unit_price_usd, line_total_usd, products(name, unit)")
    .eq("order_id", id);

  const { data: proofs, error: proofsError } = await supabase
    .from("payment_proofs")
    .select("id, file_path, uploaded_at")
    .eq("order_id", id)
    .order("uploaded_at", { ascending: false });

  const typedOrder = order as OrderDetail;
  const customer = Array.isArray(typedOrder.customers)
    ? typedOrder.customers[0]
    : typedOrder.customers;

  return (
    <div className="p-6">
      <Link href="/admin/pedidos" className="text-blue-600 hover:underline text-sm">
        ← Volver a pedidos
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">Pedido {typedOrder.id}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Cliente</h2>
          <p className="font-medium">{customer?.company_name}</p>
          <p className="text-sm text-gray-500">{customer?.contact_name}</p>
          {customer?.phone && <p className="text-sm mt-1">Teléfono: {customer.phone}</p>}
          {customer?.location && <p className="text-sm mt-1">Ubicación: {customer.location}</p>}
        </Card>

        <Card className="p-4">
          <h2 className="font-semibold mb-3">Detalles del pedido</h2>
          <p className="text-sm">
            Fecha: {new Date(typedOrder.created_at).toLocaleDateString("es-ES")}
          </p>
          <p className="text-sm mt-1">Total: USD {Number(typedOrder.total_usd).toFixed(2)}</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
              typedOrder.status === "ready_for_delivery"
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {ORDER_STATUS_LABEL[typedOrder.status]}
          </span>
          {typedOrder.notes && <p className="text-sm mt-3">Notas: {typedOrder.notes}</p>}
        </Card>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Líneas de producto</h2>
      {itemsError || !items || items.length === 0 ? (
        <Card>
          <p className="text-gray-500">No hay líneas de producto.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">Cantidad</th>
                  <th className="text-left p-3">Unidad</th>
                  <th className="text-right p-3">Precio unitario</th>
                  <th className="text-right p-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {(items as OrderItem[]).map((item) => {
                  const product = Array.isArray(item.products)
                    ? item.products[0]
                    : item.products;
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{product?.name ?? "Producto desconocido"}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3">{product?.unit ?? "-"}</td>
                      <td className="p-3 text-right">USD {Number(item.unit_price_usd).toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">USD {Number(item.line_total_usd).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <h2 className="text-lg font-semibold mt-8 mb-3">Comprobantes de pago</h2>
      {proofsError || !proofs || proofs.length === 0 ? (
        <Card>
          <p className="text-gray-500">Sin comprobante subido todavía.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(proofs as PaymentProof[]).map((proof) => (
            <Card key={proof.id} className="p-4 flex items-center justify-between">
              <p className="text-sm">
                Subido el {new Date(proof.uploaded_at).toLocaleString("es-ES")}
              </p>
              <ProofViewer filePath={proof.file_path} />
            </Card>
          ))}
        </div>
      )}

      {typedOrder.status === "in_payment" && (
        <div className="mt-8">
          <MarkReadyButton orderId={typedOrder.id} />
        </div>
      )}
    </div>
  );
}
