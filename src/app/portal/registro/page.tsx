import type { Metadata } from "next";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return (
    <PortalShell showNav={false}>
      <div className="max-w-sm mx-auto bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Crear cuenta de cliente</h1>
        <p className="text-sm mb-4">
          Cree su usuario para consultar nuestros productos y realizar pedidos.
        </p>
        <RegisterForm />
        <hr className="my-4 border-[var(--border)]" />
        <p className="text-[15px]">
          ¿Ya tiene cuenta?{" "}
          <Link href="/portal/login" className="no-underline">
            Entrar →
          </Link>
        </p>
      </div>
    </PortalShell>
  );
}
