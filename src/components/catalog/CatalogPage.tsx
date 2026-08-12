import { Section, SectionLabel, SectionTitle } from "@/components/ui/Section";
import { ProductCard } from "@/components/catalog/ProductCard";
import { RegisterBanner } from "@/components/catalog/RegisterBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { itemsByLine, LINE_META } from "@/lib/content/catalog";
import type { ProductLine } from "@/lib/db/types";

/**
 * Página de catálogo reutilizable para las 4 líneas de producto.
 * Recibe la línea y renderiza grid de tarjetas + banner de registro.
 */
export function CatalogPage({ line }: { line: ProductLine }) {
  const meta = LINE_META[line];
  const items = itemsByLine(line);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://julsaindustrial.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: meta.title,
        item: `https://julsaindustrial.com${meta.href}`,
      },
    ],
  };
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="flex-1">
        <Section>
          <SectionLabel>Catálogo</SectionLabel>
          <SectionTitle as="h1">{meta.title}</SectionTitle>
          <p className="mt-2 max-w-2xl">{meta.blurb}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {items.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
          <RegisterBanner />
        </Section>
      </main>
      <Footer />
    </>
  );
}
