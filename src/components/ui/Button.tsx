import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * Botón de acción. text-base con el root en 14px (globals.css) es texto
 * normal, no "grande" (necesitaría ≥18.66px bold) — así que el fondo debe
 * cumplir 4.5:1 con blanco, no el umbral relajado de 3:1. --accent
 * (#e76f00) solo da 3.15:1; --accent-deep (#b5520a) da 5.03:1.
 * fase3-design §1.
 */
type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-deep)] text-white font-bold hover:bg-[var(--accent-deeper)]",
  secondary:
    "bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--text)]",
  ghost: "bg-transparent text-[var(--link)] hover:underline",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center rounded px-5 py-2 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";
