import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Julsa Industrial: empresa española radicada en Panamá y República Dominicana desde 2010. Historia, misión, visión y equipo.",
};

const TIMELINE = [
  { year: "2010", text: "Fundada en España. Primeras operaciones en Panamá y República Dominicana." },
  {
    year: "2013",
    text: "Proveedor de referencia en rodamientos y elementos de transmisión para la industria.",
  },
  {
    year: "2015",
    text: "Ampliación de la gama de productos a materias primas para diversas industrias.",
  },
  {
    year: "2018",
    text: "Instalación de maquinaria y proyectos para la industria del cable.",
  },
  {
    year: "2021",
    text: "Creación de Fawalt Investment S.L en España para financiamiento de proyectos de inversión en Panamá y República Dominicana.",
  },
  { year: "2026", text: "Inicio del suministro de combustibles y gestión cooperada." },
];

const MISSION = [
  "Ofrecer a nuestros clientes productos de calidad y de última generación, con el fin de contribuir al desarrollo sostenible y a la eficiencia energética en sus hogares y negocios.",
  "Contribuir al desarrollo de Panamá y República Dominicana a través de la importación y distribución de productos de alta calidad y tecnología.",
  "A través de nuestros socios y distribuidores, crear una red sólida y estable para desarrollar nuestros negocios en Panamá y República Dominicana, mejorando las condiciones de vida de los ciudadanos y de nuestros empleados directos e indirectos.",
];

export default function NosotrosPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionLabel>Nosotros</SectionLabel>
          <SectionTitle as="h1" className="sr-only">
            Nosotros
          </SectionTitle>
          <p className="mt-2 max-w-2xl">
            Julsa Industrial es una empresa española que desde hace más de 20
            años se ha especializado en suministros de insumos y materias
            primas para el sector estatal y privado de Panamá y República Dominicana. Contamos con un
            equipo humano experimentado en las áreas de ingeniería y
            logística, así como en la gestión de proyectos y relaciones
            comerciales. Nuestro objetivo principal es ofrecer a nuestros
            clientes una solución integral y personalizada para sus
            necesidades de suministro de insumos y materias primas, así como
            un servicio de calidad y atención al cliente excepcional.
          </p>
        </Section>

        {/* Historia — timeline */}
        <Section>
          <SectionLabel>Historia</SectionLabel>
          <SectionTitle className="mb-6">Nuestra trayectoria</SectionTitle>
          <ol className="relative border-l border-[var(--border)] pl-6 space-y-6 max-w-2xl">
            {TIMELINE.map((item) => (
              <li key={item.year} className="relative">
                <span
                  className="absolute -left-[31px] top-1 inline-block w-3 h-3 rounded-full"
                  style={{ background: "var(--accent)" }}
                  aria-hidden="true"
                />
                <p className="font-bold text-[var(--accent-deep)]">{item.year}</p>
                <p className="text-sm mt-0.5">{item.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Misión / Visión */}
        <Section>
          <SectionLabel>Misión y visión</SectionLabel>
          <SectionTitle className="mb-4">Lo que nos mueve</SectionTitle>
          <div className="grid gap-4 md:grid-cols-3">
            {MISSION.map((text, i) => (
              <Card key={i}>
                <p className="text-sm">{text}</p>
              </Card>
            ))}
          </div>
        </Section>

        {/* Equipo + mapa-red (signature) */}
        <Section>
          <SectionLabel>Equipo y presencia</SectionLabel>
          <SectionTitle className="mb-4">Red de distribución</SectionTitle>
          <div>
            <p className="text-sm">
              Contamos con un equipo cualificado y experimentado en el sector
              industrial y energético, que forma parte de nuestra plantilla.
            </p>
            <p className="text-sm mt-3">
              También contamos con una red de socios y distribuidores en Panamá
              y República Dominicana, que nos permiten llegar a un amplio número
              de clientes y ofrecerles un servicio personalizado.
            </p>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
