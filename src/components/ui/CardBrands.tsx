/**
 * Tarjetas aceptadas en el pago con Stripe (revisión 11-08 §5).
 * SVG en línea: sin peticiones externas ni imágenes que cargar.
 */
function CardFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 40 26"
      role="img"
      aria-label={label}
      className="h-[26px] w-[40px] shrink-0"
    >
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="25"
        rx="3.5"
        fill="#ffffff"
        stroke="#d8dde3"
      />
      {children}
    </svg>
  );
}

export function CardBrands({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <CardFrame label="Visa">
        <text
          x="20"
          y="17"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="10"
          fontWeight="bold"
          fontStyle="italic"
          fill="#1a1f71"
        >
          VISA
        </text>
      </CardFrame>

      <CardFrame label="Mastercard">
        <circle cx="16" cy="13" r="7" fill="#eb001b" />
        <circle cx="24" cy="13" r="7" fill="#f79e1b" fillOpacity="0.85" />
      </CardFrame>

      <CardFrame label="American Express">
        <rect x="3" y="3" width="34" height="20" rx="2" fill="#2e77bc" />
        <text
          x="20"
          y="16"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="7"
          fontWeight="bold"
          fill="#ffffff"
        >
          AMEX
        </text>
      </CardFrame>
    </span>
  );
}
