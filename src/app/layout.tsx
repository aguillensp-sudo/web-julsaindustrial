import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

// Tipografía del brief: Open Sans como única familia (fase3-design §1).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://julsaindustrial.com"),
  title: {
    default: "Julsa Industrial — Suministro industrial y energético",
    template: "%s · Julsa Industrial",
  },
  description:
    "Importación y distribución de combustibles, materias primas, equipamiento energético y autopartes. Empresa española radicada en Panamá y República Dominicana desde 2010.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Julsa Industrial",
    title: "Julsa Industrial — Suministro industrial y energético",
    description:
      "Importación y distribución de combustibles, materias primas, equipamiento energético y autopartes. Empresa española radicada en Panamá y República Dominicana desde 2010.",
    url: "https://julsaindustrial.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Julsa Industrial — Suministro industrial y energético",
    description:
      "Importación y distribución de combustibles, materias primas, equipamiento energético y autopartes.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Datos estructurados Organization (SEO on-page, fase2 §4).
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Julsa Industrial S.A.",
    url: "https://julsaindustrial.com",
    telephone: "+34 673 764987",
    description:
      "Importación y distribución de combustibles, materias primas, equipamiento energético y autopartes.",
    foundingDate: "2010",
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "Calle Núñez de Balboa, 118, 1i",
        addressLocality: "Madrid",
        postalCode: "28006",
        addressCountry: "ES",
      },
    ],
  };

  return (
    <html lang="es" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
