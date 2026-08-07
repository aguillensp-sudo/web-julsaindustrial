import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Política de cookies de Julsa Industrial.",
};

export default function Page() {
  return <LegalPage title="Política de cookies" />;
}
