import { redirect } from "next/navigation";
import Link from "next/link";
import { PortalShell } from "../PortalShell";
import { getCurrentCustomer } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/portal/login");

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, line, name, description, image_path, price_usd, unit, stock")
    .eq("is_active", true)
    .order("line", { ascending: true })
    .order("name", { ascending: true });

  // Agrupar por línea.
  const byLine = (products ?? []).reduce<Record<string, typeof products>>(
    (acc, p) => {
      (acc[p.line] ??= []).push(p);
      return acc;
    },
    {},
  );

  const LINE_LABEL: Record<string, string> = {
    fuels: "Combustibles",
    energy: "Equipamiento energético",
    autoparts: "Autopartes",
    raw_materials: "Materias primas",
  };

  return (
    <PortalShell>
      <h1 className="text-2xl font-bold">Catálogo y precios</h1>
      <p className="text-sm mt-1 text-[var(--text)]/70">
        Precios en USD. Stock en tiempo real gestionado por Julsa.
      </p>

      {Object.keys(byLine).length === 0 ? (
        <div className="mt-6 p-6 rounded border border-[var(--border)] bg-[var(--surface)] text-sm">
          El catálogo está en preparación. Vuelva a consultarlo en breve.
        </div>
      ) : (
        Object.entries(byLine).map(([line, items]) => (
          <section key={line} className="mt-8">
            <h2 className="font-bold text-lg mb-3">{LINE_LABEL[line] ?? line}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items?.map((p) => (
                <Link
                  key={p.id}
                  href={`/portal/producto/${p.id}`}
                  className="no-underline bg-[var(--surface)] border border-[var(--border)] shadow-[0_1px_4px_var(--shadow)] rounded p-4 hover:border-[var(--accent)] flex flex-col"
                >
                  <h3 className="font-bold text-[var(--text)]">{p.name}</h3>
                  <p className="text-sm mt-1 flex-1">{p.description}</p>
                  <div className="mt-3 flex items-end justify-between">
                    <span className="text-xs">
                      {p.stock > 0 ? (
                        <span className="text-green-700 font-semibold">En stock</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Sin stock</span>
                      )}
                    </span>
                    <span className="font-extrabold text-[var(--accent-deep)]">
                      USD {Number(p.price_usd).toFixed(2)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </PortalShell>
  );
}
