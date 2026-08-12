import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Section,
  SectionLabel,
  SectionTitle,
} from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Pulpa de celulosa y derivados",
  description:
    "Pulpa de celulosa, non woven, siliconas, pegamentos, súper absorbente y película para la industria del papel y productos de higiene.",
};

interface PulpaDerivado {
  name: string;
  imageSrc: string;
  description: string;
}

/**
 * Catálogo de pulpa de celulosa y productos derivados para la industria del
 * papel y de productos de higiene. Accesible únicamente desde la tarjeta
 * "Pulpa de celulosa" de la página de Materias primas.
 */
const DERIVADOS: PulpaDerivado[] = [
  {
    name: "Pulpa de celulosa",
    imageSrc: "/images/pulpa1.png",
    description:
      "Pulpa Fluff Tratada y No Tratada para la producción de productos de higiene, como pañales desechables, almohadillas sanitarias, toallas húmedas entre otros.",
  },
  {
    name: "Non Woven",
    imageSrc: "/images/nonwoven.png",
    description:
      "Tela no Tejida (Non Woven), Spunbon Hidofilico de Color Blanco, de diferentes Peso Base y Dimensiones, para la producción de productos de higiene, como pañales desechables, almohadillas sanitarias, toallas húmedas entre otros.",
  },
  {
    name: "Siliconas",
    imageSrc: "/images/siliconas.png",
    description:
      "Cintas Siliconadas, de diferentes Peso Base y Dimensiones, para la producción de productos de higiene, como pañales desechables, almohadillas sanitarias, entre otros.",
  },
  {
    name: "Pegamentos",
    imageSrc: "/images/pegamentos.png",
    description:
      "Pegamento de Fijación y de Construcción, de las Marcas Henkel y Nanpo, para la producción de productos de higiena, como pañales desechables, almohadillas sanitarias, entre otros.",
  },
  {
    name: "Super absorbente",
    imageSrc: "/images/sap.png",
    description:
      "Súper adsorbente SAP, marca TAI y BASF, para la producción de productos de higiene, como pañales desechables, almohadillas sanitarias, entre otros.",
  },
  {
    name: "Película",
    imageSrc: "/images/pelicula.png",
    description:
      "Película de Polietileno Blanco, de diferentes Peso Base y Dimensiones, para la producción de productos de higiene, como pañales desechables, almohadillas sanitarias, entre otros.",
  },
];

export default function PulpaDeCelulosaPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionLabel>Materias primas</SectionLabel>
          <SectionTitle as="h1">
            Pulpa de celulosa y otros productos para industria del papel
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {DERIVADOS.map((item) => (
              <Card
                key={item.name}
                className="flex flex-col transition-shadow hover:shadow-[0_4px_16px_var(--shadow)] hover:border-[var(--accent)]"
              >
                <div className="mb-3 aspect-[4/3] w-full rounded bg-[var(--bg)] flex items-center justify-center border border-[var(--border)] overflow-hidden relative">
                  <Image
                    src={item.imageSrc}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <h2 className="font-bold text-lg text-[var(--text)]">
                  {item.name}
                </h2>
                <p className="text-sm mt-1 flex-1">{item.description}</p>
              </Card>
            ))}
          </div>
          <p className="mt-8">
            <Link
              href="/materias-primas"
              className="text-sm font-semibold text-[var(--link)]"
            >
              ← Volver a Materias primas
            </Link>
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
