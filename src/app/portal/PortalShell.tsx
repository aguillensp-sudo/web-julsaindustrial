import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "./LogoutButton";
import { CartIcon } from "@/components/ui/CartIcon";

/**
 * Shell del portal (zona privada). Mantiene cabecera/pie pero con un fondo
 * diferenciado para señalar al usuario que está en área privada.
 *
 * Incluye una barra de navegación propia del área de usuario, presente en
 * todas sus pantallas: vuelta al portal, tienda (carrito) y mis pedidos.
 * Los enlaces van a 15px (2px más que el text-sm anterior) por legibilidad.
 */
export function PortalShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  /** false en las pantallas sin sesión (login, registro, recuperar). */
  showNav?: boolean;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-[1000px] mx-auto px-6 py-10">
          {showNav && (
          <nav
            aria-label="Navegación del área de cliente"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] border-b border-[var(--border)] pb-3 mb-6"
          >
            <Link href="/portal" className="no-underline hover:underline">
              ← Volver al portal
            </Link>
            <Link
              href="/portal/catalogo"
              className="no-underline hover:underline inline-flex items-center gap-1.5"
            >
              <CartIcon className="w-[18px] h-[18px]" />
              Carrito
            </Link>
            <Link href="/portal/mis-pedidos" className="no-underline hover:underline">
              Mis pedidos
            </Link>
            <span className="ml-auto">
              <LogoutButton />
            </span>
          </nav>
          )}
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
