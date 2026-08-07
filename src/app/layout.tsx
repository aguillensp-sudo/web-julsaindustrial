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
    default: "Julsa Industrial — Suministro industrial y energético para Cuba",
    template: "%s · Julsa Industrial",
  },
  description:
    "Importación y distribución de combustibles, materias primas, equipamiento energético y autopartes. Empresa española radicada en Cuba desde 2010.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
