import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProductForm } from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>
        <div className="rounded-lg border border-[var(--border)] bg-white p-6">
          <p className="mb-4 text-sm text-gray-600">Producto no encontrado.</p>
          <Link href="/admin/productos">
            <Button variant="ghost">Volver a productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Editar producto</h1>
      <div className="rounded-lg border border-[var(--border)] bg-white p-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
