import { HTMLAttributes, ReactNode } from "react";

/**
 * Bloque de superficie blanca con borde y sombra del brief.
 * Usado para producto, info, contacto y nosotros. fase3-design §1.
 */
export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] p-5 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
