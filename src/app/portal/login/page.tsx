import type { Metadata } from "next";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso clientes",
};

export default function LoginPage() {
  return (
    <PortalShell showNav={false}>
      <div className="max-w-sm mx-auto bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Acceso clientes</h1>
        <p className="text-sm mb-4">Entre para ver precios y realizar pedidos.</p>
        <LoginForm />
        <hr className="my-4 border-[var(--border)]" />
        <p className="text-[15px]">
          ¿Sin cuenta?{" "}
          <Link href="/portal/registro" className="no-underline">
            Crear usuario →
          </Link>
        </p>
        <p className="text-[15px] mt-2">
          <Link href="/portal/recuperar" className="no-underline">
            ¿Olvidó su contraseña?
          </Link>
        </p>
      </div>
    </PortalShell>
  );
}
