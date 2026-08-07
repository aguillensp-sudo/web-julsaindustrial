import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Aviso legal de Julsa Industrial S.A.",
};

export default function Page() {
  return <LegalPage title="Aviso legal" />;
}
