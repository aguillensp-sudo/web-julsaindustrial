import { ButtonHTMLAttributes, forwardRef } from "react";

/**
 * Botón de acción. Naranja (--accent) con texto blanco bold ≥16px
 * para cumplir WCAG AA (ratio ~3.2:1 supera el umbral de texto grande).
 * fase3-design §1.
 */
type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  // Naranja del brief; texto en bold 16px para contraste AA.
  primary:
    "bg-[var(--accent)] text-white font-bold hover:bg-[var(--accent-deep)]",
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
