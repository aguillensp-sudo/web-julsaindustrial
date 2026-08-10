import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Combustibles",
  description:
    "Gasolina, petróleo y balitas de gas (GLP) para uso industrial y comercial en Panamá y República Dominicana.",
};

export default function Page() {
  return <CatalogPage line="fuels" />;
}
