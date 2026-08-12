import Image from "next/image";
import Link from "next/link";
import { MobileMenu } from "./MobileMenu";

/**
 * Cabecera sticky en --ink con menú principal y CTA.
 * fase3-design §3.1. Navegación: zona pública + CTA "Acceso clientes".
 * En móvil (< md) el menú se pliega en un botón hamburguesa.
 */
const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/combustibles", label: "Combustibles" },
  { href: "/equipamiento-energetico", label: "Equipamiento energético" },
  { href: "/autopartes", label: "Autopartes" },
  { href: "/materias-primas", label: "Materias primas" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--ink)] text-white">
      <div className="relative max-w-[1200px] mx-auto px-6 h-20 flex items-center gap-6">
        <Link href="/" className="flex items-center no-underline shrink-0">
          <Image
            src="/images/logo-julsa.png"
            alt="Julsa Industrial"
            width={210}
            height={60}
            className="h-14 w-auto"
            priority
          />
        </Link>
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-1 text-[15px]"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded px-2 py-1.5 text-white/90 hover:text-white hover:bg-[var(--accent)] no-underline transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/portal/login"
          className="ml-auto hidden md:inline-flex no-underline items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold text-sm px-4 py-1.5"
        >
          Acceso clientes
        </Link>

        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
