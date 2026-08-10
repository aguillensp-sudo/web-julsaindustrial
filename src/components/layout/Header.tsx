import Image from "next/image";
import { ComingSoonLink } from "@/components/ComingSoonLink";
import Link from "next/link";

/**
 * Cabecera sticky en --ink con menú principal y CTA.
 * fase3-design §3.1. Navegación: zona pública + CTA "Acceso clientes".
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
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center no-underline shrink-0">
          <Image
            src="/images/logo-julsa.png"
            alt="Julsa Industrial"
            width={140}
            height={40}
            className="h-9 w-auto"
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
        <ComingSoonLink
          href="/portal/login"
          className="ml-auto no-underline inline-flex items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold text-sm px-4 py-1.5"
        >
          Acceso clientes
        </ComingSoonLink>
      </div>
    </header>
  );
}
