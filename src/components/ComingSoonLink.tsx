"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

const COMING_SOON_MESSAGE =
  "Estamos trabajando en la nueva web. Disculpe las molestias. En breve podrá acceder a nuestros productos y realizar compras.";

/**
 * Sustituto de <Link>/<a> para puntos de entrada al portal (/portal/login,
 * /portal/registro) mientras el portal no está disponible al público.
 * Intercepta el click, muestra un aviso y NO navega. No modifica las
 * páginas /portal/* en sí, solo estos enlaces de entrada.
 */
export function ComingSoonLink({
  href,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    window.alert(COMING_SOON_MESSAGE);
    onClick?.(e);
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
