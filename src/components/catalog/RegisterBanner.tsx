import Link from "next/link";
import { Card } from "@/components/ui/Card";

/**
 * Banner recurrente de registro. Texto del brief (Definiciones Previas §Contenidos).
 * Aparece bajo cada catálogo para impulsar el alta en el portal.
 */
export function RegisterBanner() {
  return (
    <Card className="mt-8 border-[var(--accent)]">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="flex-1">
          Para conocer en detalle los productos que suministramos, cree un
          usuario y acceda a su área personal desde la que podrá obtener el
          detalle de los productos. Anímese, entre y verifique{" "}
          <strong>nuestros precios</strong>, los mejores en Panamá y República Dominicana.
        </p>
        <Link
          href="/portal/registro"
          className="shrink-0 no-underline inline-flex items-center justify-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2"
        >
          Crear usuario →
        </Link>
      </div>
    </Card>
  );
}
