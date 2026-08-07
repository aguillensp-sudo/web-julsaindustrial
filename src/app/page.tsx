import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

/**
 * Home provisional del cimiento (Hito 1).
 * El hero reel real y los bloques finales se construyen en Hito 2 (tarea 2.1);
 * aquí solo se valida que el sistema de diseño compila.
 */
const PRODUCT_LINES = [
  { href: "/combustibles", label: "Combustibles", desc: "Gasolina, petróleo, balitas de gas" },
  { href: "/equipamiento-energetico", label: "Equipamiento energético", desc: "Placas solares, baterías, inversores" },
  { href: "/autopartes", label: "Autopartes", desc: "Baterías, neumáticos, lubricantes" },
  { href: "/materias-primas", label: "Materias primas", desc: "Acerías e industrias del papel" },
];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero provisional — el reel real entra en Hito 2 */}
        <section className="bg-[var(--ink)] text-white">
          <div className="max-w-[1200px] mx-auto px-6 py-20">
            <SectionLabel>Julsa Industrial</SectionLabel>
            <h1 className="text-4xl font-extrabold mt-2 max-w-2xl">
              Suministro industrial y energético para Cuba
            </h1>
            <p className="mt-4 max-w-xl text-white/80">
              Importación y distribución de combustibles, materias primas,
              equipamiento energético y autopartes. Empresa española radicada en
              Cuba desde 2010.
            </p>
            <Link
              href="/portal/login"
              className="mt-6 inline-flex no-underline items-center rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-5 py-2"
            >
              Acceso clientes →
            </Link>
          </div>
        </section>

        <Section>
          <SectionLabel>Líneas de producto</SectionLabel>
          <SectionTitle className="mb-4">Lo que suministramos</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {PRODUCT_LINES.map((line) => (
              <Card key={line.href}>
                <h3 className="font-bold text-lg">{line.label}</h3>
                <p className="text-sm mt-1">{line.desc}</p>
                <Link href={line.href} className="text-sm mt-3 inline-block no-underline">
                  Ver catálogo →
                </Link>
              </Card>
            ))}
          </div>
        </Section>

        <Section>
          <Card className="border-[var(--accent)]">
            <SectionLabel>Portal de clientes</SectionLabel>
            <p className="mt-2">
              Cree su usuario y acceda a su área personal para ver el detalle de
              productos y nuestros precios en USD.
            </p>
            <Link
              href="/portal/registro"
              className="mt-3 inline-flex no-underline items-center rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-4 py-2"
            >
              Crear usuario →
            </Link>
          </Card>
        </Section>
      </main>
      <Footer />
    </>
  );
}
