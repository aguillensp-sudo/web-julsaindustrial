import Link from "next/link";

/**
 * Pie en --ink. Contacto, mapa web, políticas y enlace al portal.
 * fase3-design §3.1 (estructura transversal).
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[var(--ink)] text-white/80 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <p className="font-bold text-white mb-2">Julsa Industrial S.A.</p>
          <p>Tfno: +53 72636260</p>
          <p>La Habana, Cuba · Madrid, España</p>
        </div>
        <nav aria-label="Mapa web">
          <p className="font-bold text-white mb-2">Web</p>
          <ul className="-mx-1">
            <li>
              <Link href="/nosotros" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Contacto
              </Link>
            </li>
            <li>
              <Link href="/portal/login" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Acceso clientes
              </Link>
            </li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <p className="font-bold text-white mb-2">Legal</p>
          <ul className="-mx-1">
            <li>
              <Link href="/legal/aviso-legal" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Aviso legal
              </Link>
            </li>
            <li>
              <Link href="/legal/privacidad" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link href="/legal/cookies" className="block px-1 py-1.5 text-white/80 hover:text-white no-underline">
                Política de cookies
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        © {year} Julsa Industrial S.A. Todos los derechos reservados.
      </div>
    </footer>
  );
}
