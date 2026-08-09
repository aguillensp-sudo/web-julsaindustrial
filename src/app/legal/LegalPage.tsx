import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Section, SectionTitle } from "@/components/ui/Section";

/**
 * Contenedor de página legal (aviso legal, privacidad, cookies).
 * El contenido definitivo lo aporta el Product Owner (fase2-define-spec §5).
 * Mientras tanto muestra un placeholder claro.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Section>
          <SectionTitle as="h1">{title}</SectionTitle>
          {lastUpdated && (
            <p className="text-xs text-[var(--text)]/60 mt-1">
              Última actualización: {lastUpdated}
            </p>
          )}
          <div className="mt-4 max-w-3xl prose-sm">
            {children ?? (
              <p className="p-4 rounded border border-[var(--accent)] bg-[var(--bg)]">
                El contenido definitivo de esta página está pendiente de
                aprobación por el Product Owner. Se incorporará antes de la
                publicación de la web.
              </p>
            )}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
