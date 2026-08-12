import { redirect } from "next/navigation";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { CartView } from "./CartView";

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Carrito</h1>
      <CartView />
    </PortalShell>
  );
}
