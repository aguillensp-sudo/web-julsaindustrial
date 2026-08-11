import type { Metadata } from "next";
import { PortalShell } from "../PortalShell";
import { ResetPasswordForm } from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
};

export const dynamic = "force-dynamic";

export default function RestablecerPage() {
  return (
    <PortalShell showNav={false}>
      <div className="max-w-sm mx-auto bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Restablecer contraseña</h1>
        <p className="text-sm mb-4">
          Introduzca su nueva contraseña de acceso al portal.
        </p>
        <ResetPasswordForm />
      </div>
    </PortalShell>
  );
}
