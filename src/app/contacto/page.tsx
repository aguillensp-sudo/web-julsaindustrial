import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacte con Julsa Industrial. Sede en Madrid (España). Tfno: +34 673 764987.",
};

const SEDES = [
  {
    city: "Madrid",
    country: "España",
    address: "c/Núñez de Balboa, 118, 1ºI, Madrid, España",
    maps: "https://www.google.com/maps/search/?api=1&query=Núñez+de+Balboa+118+Madrid",
  },
];

export default function ContactoPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionLabel>Contacto</SectionLabel>
          <SectionTitle as="h1">Hablemos</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2 mt-4">
            <Card>
              <ContactForm />
            </Card>
            <div className="space-y-4">
              <Card>
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/logo-julsa.png"
                    alt="Julsa Industrial"
                    width={64}
                    height={64}
                    className="h-12 w-auto"
                  />
                  <p className="font-bold">Julsa Industrial S.A.</p>
                </div>
                <p className="text-sm mt-2">Teléfono: +34 673 764987</p>
                <p className="text-sm mt-1">
                  <a href="mailto:administracion@julsaindustrial.com">
                    administracion@julsaindustrial.com
                  </a>
                </p>
              </Card>
              {SEDES.map((sede) => (
                <Card key={sede.city}>
                  <p className="font-semibold">
                    {sede.city} · <span className="text-[var(--link)]">{sede.country}</span>
                  </p>
                  <p className="text-sm mt-1">{sede.address}</p>
                  <a
                    href={sede.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-2 inline-block"
                  >
                    Ver en Google Maps →
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
