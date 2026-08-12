import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "./LogoutButton";
import { CartIcon } from "@/components/ui/CartIcon";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell del portal (zona privada). Mantiene cabecera/pie pero con un fondo
 * diferenciado para señalar al usuario que está en área privada.
 *
 * Incluye una barra de navegación propia del área de usuario, presente en
 * todas sus pantallas: vuelta al portal, tienda, carrito (con el número de
 * artículos) y mis pedidos. Los enlaces van a 15px por legibilidad.
 */
async function getCartCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id);
  return count ?? 0;
}

export async function PortalShell({
  children,
  showNav = true,
}: {
  children: React.ReactNode;
  /** false en las pantallas sin sesión (login, registro, recuperar). */
  showNav?: boolean;
}) {
  const cartCount = showNav ? await getCartCount() : 0;

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
              <Link href="/portal/catalogo" className="no-underline hover:underline">
                Tienda
              </Link>
              <Link
                href="/portal/carrito"
                className="no-underline hover:underline inline-flex items-center gap-1.5"
              >
                <CartIcon className="w-[18px] h-[18px]" />
                Carrito
                {cartCount > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[var(--accent-deep)] text-white text-xs font-bold"
                    aria-label={`${cartCount} artículos en el carrito`}
                  >
                    {cartCount}
                  </span>
                )}
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
