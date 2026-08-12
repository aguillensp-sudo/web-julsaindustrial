import type { Metadata } from "next";
import { CatalogPage } from "@/components/catalog/CatalogPage";

export const metadata: Metadata = {
  title: "Autopartes",
  description: "Baterías, neumáticos y lubricantes para vehículo.",
  alternates: { canonical: "/autopartes" },
};

export default function Page() {
  return <CatalogPage line="autoparts" />;
}
