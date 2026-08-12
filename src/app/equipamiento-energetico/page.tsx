import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Equipamiento energético",
  description:
    "Placas solares fotovoltaicas, baterías de almacenamiento e inversores.",
  alternates: { canonical: "/equipamiento-energetico" },
};

export default function Page() {
  return <CatalogPage line="energy" />;
}
