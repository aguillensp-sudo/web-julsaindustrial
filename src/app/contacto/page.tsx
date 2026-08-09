import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacte con Julsa Industrial. Sedes en La Habana (Cuba) y Madrid (España). Tfno: +53 72636260.",
};

const SEDES = [
  {
    city: "La Habana",
    country: "Cuba",
    address: "c/202, #1918, e/19 y 21, Siboney, Playa, La Habana, Cuba",
    maps: "https://maps.app.goo.gl/kewUXkNbjRTr2mrN9",
  },
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
                <p className="font-bold">Julsa Industrial S.A.</p>
                <p className="text-sm mt-1">Teléfono: +53 72636260</p>
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
