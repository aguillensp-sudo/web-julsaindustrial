import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pago cancelado",
  robots: { index: false },
};

export default function CancelPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionLabel>Pago</SectionLabel>
          <SectionTitle as="h1">Pago cancelado</SectionTitle>
          <Card className="mt-6 max-w-2xl">
            <p className="text-[var(--text)]">
              Has cancelado el proceso de pago. No se ha realizado ningún
              cargo. Puedes intentarlo de nuevo cuando quieras.
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
