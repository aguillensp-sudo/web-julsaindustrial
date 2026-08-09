import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/Section";

export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/admin/productos",
    title: "Productos",
    description: "Gestiona el catálogo de productos de Julsa Industrial.",
  },
  {
    href: "/admin/pedidos",
    title: "Pedidos",
    description: "Consulta y gestiona los pedidos de los clientes.",
  },
  {
    href: "/admin/clientes",
    title: "Clientes",
    description: "Administra la información de los clientes registrados.",
  },
  {
    href: "/admin/productos",
    title: "Stock",
    description: "Actualiza el inventario de productos.",
  },
];

export default function AdminPage() {
  return (
    <div>
      <SectionTitle>Panel de administración</SectionTitle>
      <p className="text-[var(--text)] mb-8">
        Bienvenido al panel de administración de Julsa Industrial.
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.title} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
                {link.title}
              </h2>
              <p className="text-sm text-[var(--text)]">
                {link.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
