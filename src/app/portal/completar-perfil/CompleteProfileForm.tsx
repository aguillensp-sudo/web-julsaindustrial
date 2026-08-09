"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeProfile, type CompleteProfileResult } from "./profileActions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function CompleteProfileForm({
  customer,
}: {
  customer: { company_name: string; contact_name: string; phone: string | null; location: string | null };
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: CompleteProfileResult | undefined, formData: FormData) =>
      completeProfile(formData),
    undefined,
  );

  useEffect(() => {
    if (state?.ok === true) {
      router.push("/portal");
    }
  }, [state, router]);

  return (
    <Card>
      <form action={formAction} className="space-y-4 p-6">
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium mb-1">
            Empresa
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            required
            defaultValue={customer.company_name}
            className="w-full px-3 py-2 border-[var(--border)] border rounded"
          />
        </div>

        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium mb-1">
            Contacto
          </label>
          <input
            type="text"
            id="contact_name"
            name="contact_name"
            required
            defaultValue={customer.contact_name}
            className="w-full px-3 py-2 border-[var(--border)] border rounded"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Teléfono
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            defaultValue={customer.phone ?? ""}
            className="w-full px-3 py-2 border-[var(--border)] border rounded"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            name="location"
            defaultValue={customer.location ?? ""}
            className="w-full px-3 py-2 border-[var(--border)] border rounded"
          />
        </div>

        {state?.ok === false && (
          <p className="text-red-700 text-xs">{state.error}</p>
        )}

        <Button type="submit" variant="primary" disabled={pending}>
          Guardar y continuar
        </Button>
      </form>
    </Card>
  );
}
