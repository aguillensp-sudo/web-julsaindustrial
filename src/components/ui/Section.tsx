import { ReactNode } from "react";

/**
 * Sección de página con ancho máximo y padding consistentes.
 * Max-width 1200px, gutters 24px (fase3-design §1 layout).
 */
export function Section({
  children,
  className = "",
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <section
      className={`w-full px-6 py-10 ${wide ? "" : "max-w-[1200px] mx-auto"} ${className}`}
    >
      {children}
    </section>
  );
}

/** Eyebrow / etiqueta de sección en SemiBold mayúsculas. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block text-[var(--link)] font-semibold text-xs uppercase tracking-wide mb-1">
      {children}
    </span>
  );
}

/** Encabezado de bloque (Heading, Bold 22-28px). */
export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-2xl font-bold text-[var(--text)] ${className}`}>
      {children}
    </h2>
  );
}
