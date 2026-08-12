import type { Metadata } from "next";

/**
 * Zona privada del portal de clientes: nunca debe indexarse.
 * robots.txt ya la excluye; esto añade noindex en el HTML por si
 * Google llega por un enlace directo.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
