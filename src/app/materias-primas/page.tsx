import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Materias primas",
  description:
    "Insumos para acerías (sílico manganeso, ferrosilicio, electrodos de grafito) e industrias del papel.",
  alternates: { canonical: "/materias-primas" },
};

export default function Page() {
  return <CatalogPage line="raw_materials" />;
}
