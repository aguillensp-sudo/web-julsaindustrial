import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/auth/session";
import { PortalShell } from "../PortalShell";
import { CompleteProfileForm } from "./CompleteProfileForm";

export const dynamic = "force-dynamic";

export default async function CompleteProfilePage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/portal/login");
  }

  if (customer.profile_completed) {
    redirect("/portal");
  }

  return (
    <PortalShell showNav={false}>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-2">Complete su perfil</h1>
        <p className="text-sm text-[var(--text)]/70 mb-6">
          Antes de continuar, confirme los datos de su empresa.
        </p>
        <CompleteProfileForm
          customer={{
            company_name: customer.company_name,
            contact_name: customer.contact_name,
            phone: customer.phone,
            location: customer.location,
          }}
        />
      </div>
    </PortalShell>
  );
}
