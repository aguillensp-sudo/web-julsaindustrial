import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6 py-20">
          <p className="text-[var(--accent)] font-bold text-sm uppercase tracking-wide">
            Error 404
          </p>
          <h1 className="text-3xl font-extrabold mt-2">Página no encontrada</h1>
          <p className="mt-3 text-sm">
            La página que busca no existe o ha sido movida.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex no-underline items-center rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-5 py-2"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
