import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad y tratamiento de datos personales de Julsa Industrial.",
};

export default function Page() {
  return <LegalPage title="Política de privacidad" />;
}
