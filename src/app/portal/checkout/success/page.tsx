import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const { order_id } = await searchParams;

  return (
    <PortalShell>
      <div className="rounded border border-green-600 bg-green-50 p-6" role="status">
        <h1 className="text-2xl font-bold text-green-800">¡Pago recibido!</h1>
        <p className="mt-2 text-sm">
          Tu pago se ha procesado correctamente. Puedes ver el estado de tu pedido en{" "}
          <Link href="/portal/mis-pedidos" className="underline">
            Mis pedidos
          </Link>
          .
        </p>
        {order_id && (
          <p className="mt-2 text-xs text-[var(--text)]/70">Pedido: {order_id}</p>
        )}
      </div>
    </PortalShell>
  );
}
