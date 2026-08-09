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
        <Link
          href="/"
          className="font-extrabold text-lg tracking-tight text-white no-underline"
        >
          JULSA<span className="text-[var(--accent)]">INDUSTRIAL</span>
        </Link>
        <nav
          aria-label="Navegación principal"
          className="hidden md:flex items-center gap-4 text-sm"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/90 hover:text-white no-underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/portal/login"
          className="ml-auto no-underline inline-flex items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold text-sm px-4 py-1.5"
        >
          Acceso clientes
        </Link>
      </div>
    </header>
  );
}
