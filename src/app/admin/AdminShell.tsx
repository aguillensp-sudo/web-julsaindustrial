import Link from "next/link";
import { AdminLogoutButton } from "./AdminLogoutButton";

export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string | null;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[var(--ink)] sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="text-white font-semibold">
              Panel
            </Link>
            <Link href="/admin/productos" className="text-white/80 hover:text-white">
              Productos
            </Link>
            <Link href="/admin/pedidos" className="text-white/80 hover:text-white">
              Pedidos
            </Link>
            <Link href="/admin/clientes" className="text-white/80 hover:text-white">
              Clientes
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            {adminEmail && (
              <span className="text-white/80 text-sm">{adminEmail}</span>
            )}
            <AdminLogoutButton />
          </div>
        </div>
      </header>
      <main className="bg-[var(--bg)] flex-1">
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
