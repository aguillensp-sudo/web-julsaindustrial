import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ComingSoonLink } from "@/components/ComingSoonLink";
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
              Empresa española de distribución y comercialización mayorista desde 2010
            </SectionTitle>
            <Link href="/nosotros" className="no-underline shrink-0">
              Conózcanos →
            </Link>
          </div>
          <p className="mt-3 max-w-2xl">
            Julsa Industrial se dedica a la importación y distribución de
            combustibles, materias primas para la industria, autopartes y
            equipamiento energético para el sector industrial y comercial.
          </p>
        </Section>

        {/* Líneas de producto */}
        <Section>
          <SectionLabel>Líneas de producto</SectionLabel>
          <SectionTitle className="mb-4">Lo que suministramos</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINES.map((line) => (
              <Link
                key={line}
                href={LINE_META[line].href}
                className="no-underline"
              >
                <Card className="h-full transition-shadow hover:shadow-[0_4px_16px_var(--shadow)] hover:border-[var(--accent)]">
                  <h3 className="font-bold text-lg">{LINE_META[line].title}</h3>
                  <p className="text-sm mt-1">{LINE_META[line].cardBlurb}</p>
                  <span className="text-sm mt-3 inline-block">Ver detalles →</span>
                </Card>
              </Link>
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
                Camagüey y Bayamo.
              </p>
              <Link href="/contacto" className="text-sm mt-3 inline-block no-underline">
                Ver contacto →
              </Link>
            </div>
            <Card>
              <Image
                src="/images/mapa.png"
                alt="Mapa de la red de distribución de Julsa Industrial en Cuba"
                width={600}
                height={340}
                className="w-full h-auto rounded"
              />
            </Card>
          </div>
        </Section>

        {/* CTA portal */}
        <Section>
          <Card className="border-[var(--accent)]">
            <SectionLabel>Portal de clientes</SectionLabel>
            <p className="mt-2">
              Cree su usuario y acceda a su área personal para poder adquirir
              nuestros productos.
            </p>
            <ComingSoonLink
              href="/portal/registro"
              className="mt-3 inline-flex no-underline items-center rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-4 py-2"
            >
              Crear usuario →
            </ComingSoonLink>
          </Card>
        </Section>
      </main>
      <Footer />
    </>
  );
}
