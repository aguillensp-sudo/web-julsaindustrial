import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { DistributionMap } from "@/components/cuba/DistributionMap";
import { HeroReel } from "./HeroReel";
import { LINE_META } from "@/lib/content/catalog";
import type { ProductLine } from "@/lib/db/types";

const LINES: ProductLine[] = ["fuels", "energy", "autoparts", "raw_materials"];

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroReel />

        {/* Sobre nosotros */}
        <Section>
          <SectionLabel>Sobre nosotros</SectionLabel>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <SectionTitle className="max-w-xl">
              Empresa española radicada en Cuba desde 2010
            </SectionTitle>
            <Link href="/nosotros" className="no-underline shrink-0">
              Conózcanos →
            </Link>
          </div>
          <p className="mt-3 max-w-2xl">
            Julsa Industrial se dedica a la importación y distribución de
            combustibles, materias primas para la industria y equipamiento
            energético para el sector industrial y comercial.
          </p>
        </Section>

        {/* Líneas de producto */}
        <Section>
          <SectionLabel>Líneas de producto</SectionLabel>
          <SectionTitle className="mb-4">Lo que suministramos</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINES.map((line) => (
              <Card key={line}>
                <h3 className="font-bold text-lg">{LINE_META[line].title}</h3>
                <p className="text-sm mt-1">{LINE_META[line].blurb}</p>
                <Link
                  href={LINE_META[line].href}
                  className="text-sm mt-3 inline-block no-underline"
                >
                  Ver catálogo →
                </Link>
              </Card>
            ))}
          </div>
        </Section>

        {/* Contacto / sedes (mapa compacto) */}
        <Section>
          <SectionLabel>Contacto y sedes</SectionLabel>
          <SectionTitle className="mb-4">Red de distribución</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <p className="text-sm">
                Sedes en <strong>La Habana</strong> (Cuba) y <strong>Madrid</strong>{" "}
                (España), con red de socios y distribuidores en Cienfuegos,
                Camagüey, Holguín y Bayamo.
              </p>
              <Link href="/contacto" className="text-sm mt-3 inline-block no-underline">
                Ver contacto →
              </Link>
            </div>
            <Card>
              <DistributionMap compact />
            </Card>
          </div>
        </Section>

        {/* CTA portal */}
        <Section>
          <Card className="border-[var(--accent)]">
            <SectionLabel>Portal de clientes</SectionLabel>
            <p className="mt-2">
              Cree su usuario y acceda a su área personal para ver el detalle de
              productos y nuestros precios en USD.
            </p>
            <Link
              href="/portal/registro"
              className="mt-3 inline-flex no-underline items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-4 py-2"
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
