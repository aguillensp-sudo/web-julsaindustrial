import { redirect } from "next/navigation";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Finalizar pedido</h1>
      <CheckoutForm />
    </PortalShell>
  );
}
