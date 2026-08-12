"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Menú hamburguesa de la cabecera en móvil (< md). El menú de escritorio se
 * oculta a partir de esa anchura, así que sin esto no hay navegación posible
 * desde el teléfono.
 *
 * Se cierra al cambiar de página, al pulsar Escape y al tocar fuera del panel.
 */
export function MobileMenu({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  // Al navegar (incluido atrás/adelante del navegador), el panel debe quedar
  // cerrado en la página nueva. Ajuste en render, no en efecto.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div className="md:hidden ml-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        className="relative z-50 flex h-11 w-11 items-center justify-center rounded text-white hover:bg-[var(--accent)]"
      >
        {open ? <CloseIcon /> : <BurgerIcon />}
      </button>

      {open && (
        <>
          {/* Capa para cerrar tocando fuera del panel. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 cursor-default"
          />
          <nav
            id="mobile-menu"
            // La cabecera de escritorio sigue en el DOM aunque esté oculta:
            // etiqueta distinta para no duplicar el landmark de navegación.
            aria-label="Navegación principal móvil"
            className="absolute left-0 right-0 top-full z-50 bg-[var(--ink)] border-t border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          >
            <ul className="flex flex-col px-4 py-3">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded px-3 py-3 text-white no-underline hover:bg-[var(--accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 pt-3 border-t border-white/10">
                <Link
                  href="/portal/login"
                  onClick={() => setOpen(false)}
                  className="block rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] px-3 py-3 text-center text-white font-bold no-underline"
                >
                  Acceso clientes
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}

function BurgerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
