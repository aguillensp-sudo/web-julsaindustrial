import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Combustibles",
  description:
    "Gasolina, petróleo y balitas de gas (GLP) para uso industrial y comercial en Cuba.",
};

export default function Page() {
  return <CatalogPage line="fuels" />;
}
