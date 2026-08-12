import { PortalShell } from "../PortalShell";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export default function ActualizarPasswordPage() {
  return (
    <PortalShell>
      <div className="max-w-sm mx-auto bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-6">
        <h1 className="text-2xl font-bold mb-1">Nueva contraseña</h1>
        <p className="text-sm mb-4">Escriba su nueva contraseña de acceso.</p>
        <UpdatePasswordForm />
      </div>
    </PortalShell>
  );
}
