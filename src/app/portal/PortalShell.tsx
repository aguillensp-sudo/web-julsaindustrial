import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LogoutButton } from "./LogoutButton";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartLink } from "./CartLink";

/**
 * Shell del portal (zona privada). Mantiene cabecera/pie pero con un fondo
 * diferenciado para señalar al usuario que está en área privada.
 */
export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1 bg-[var(--bg)]">
        <div className="max-w-[1000px] mx-auto px-6 py-10">
          <div className="flex justify-end items-center gap-4">
            <CartLink />
            <LogoutButton />
          </div>
          {children}
        </div>
      </main>
      <Footer />
    </CartProvider>
  );
}
