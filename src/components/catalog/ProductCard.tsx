import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { CatalogItem } from "@/lib/content/catalog";

/**
 * Tarjeta de producto pública. Muestra imagen/icono + nombre + descripción +
 * especificaciones. NO muestra precio (privado, solo portal autenticado).
 * Si `item.pageHref` está definido, la tarjeta completa es un enlace de
 * navegación interna.
 */
export function ProductCard({ item }: { item: CatalogItem }) {
  const cardContent = (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-[0_4px_16px_var(--shadow)] hover:border-[var(--accent)]">
      <div className="mb-3 aspect-[4/3] w-full rounded bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] overflow-hidden relative">
        {item.visual === "image" && item.imageSrc ? (
          <Image
            src={item.imageSrc}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : item.visual === "icon" ? (
          <ProductIcon name={item.iconName ?? "box"} />
        ) : (
          <PhotoPlaceholder label={item.name} />
        )}
      </div>
      <h2 className="font-bold text-lg text-[var(--text)]">{item.name}</h2>
      <p className="text-sm mt-1 flex-1">{item.description}</p>
      {item.specs && item.specs.length > 0 && (
        <ul className="mt-3 space-y-1">
          {item.specs.map((spec) => (
            <li
              key={spec}
              className="text-sm font-semibold text-[var(--text)] data-spec"
            >
              {spec}
            </li>
          ))}
        </ul>
      )}
      {item.links && item.links.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {item.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[var(--link)]"
            >
              {link.label} →
            </a>
          ))}
        </div>
      )}
    </Card>
  );

  if (item.pageHref) {
    return (
      <Link
        href={item.pageHref}
        aria-label={`Ver ${item.name}`}
        className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

/** Marcador de foto (hasta que Alvaro aporte las imágenes reales). */
function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-[var(--border)]">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" />
        <path d="M3 17l5-4 4 3 3-2 6 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="text-xs mt-2 text-[var(--text)]">{label}</span>
    </div>
  );
}

/** Iconos monocromos para Combustibles (set coherente). */
function ProductIcon({ name }: { name: string }) {
  const common = {
    width: 48,
    height: 48,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: 1.6,
    "aria-hidden": true as const,
  };
  switch (name) {
    case "fuel":
      return (
        <svg {...common}>
          <path d="M4 20V5a1 1 0 011-1h6a1 1 0 011 1v15" />
          <path d="M3 20h11" />
          <path d="M12 9h3l2 2v5a1 1 0 002 0V8l-3-3" />
        </svg>
      );
    case "droplet":
      return (
        <svg {...common}>
          <path d="M12 3s6 6.5 6 10.5a6 6 0 01-12 0C6 9.5 12 3 12 3z" />
        </svg>
      );
    case "gas":
      return (
        <svg {...common}>
          <rect x="6" y="9" width="12" height="11" rx="1" />
          <path d="M6 13h12" />
          <path d="M10 6h4v3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="1" />
        </svg>
      );
  }
}
