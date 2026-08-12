import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pago completado",
  robots: { index: false },
};

export default function SuccessPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionLabel>Pago</SectionLabel>
          <SectionTitle as="h1">Pago completado</SectionTitle>
          <Card className="mt-6 max-w-2xl">
            <p className="text-[var(--text)]">
              Gracias por tu pago. Hemos recibido la confirmación y en breve
              nos pondremos en contacto contigo con los siguientes pasos.
            </p>
            <Link href="/" className="inline-block mt-5">
              <Button variant="secondary">Volver al inicio</Button>
            </Link>
          </Card>
        </Section>
      </main>
      <Footer />
    </>
  );
}
