import type { Metadata } from "next";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { RecoverForm } from "./RecoverForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function RecuperarPage() {
  return (
    <PortalShell showNav={false}>
      <div className="max-w-sm mx-auto bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Recuperar contraseña</h1>
        <p className="text-sm mb-4">
          Le enviaremos un enlace para restablecer su contraseña.
        </p>
        <RecoverForm />
        <hr className="my-4 border-[var(--border)]" />
        <Link href="/portal/login" className="text-sm no-underline">
          ← Volver a acceso
        </Link>
      </div>
    </PortalShell>
  );
}
