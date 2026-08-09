import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ToggleActiveButton } from "./ToggleActiveButton";
import type { ProductLine } from "@/lib/db/types";

export const dynamic = "force-dynamic";

const LINE_LABEL: Record<ProductLine, string> = {
  fuels: "Combustibles",
  energy: "Equipamiento energético",
  autoparts: "Autopartes",
  raw_materials: "Materias primas",
};

const LINE_ORDER: ProductLine[] = ["fuels", "energy", "autoparts", "raw_materials"];

export default async function AdminProductsPage() {
  const supabase = createAdminClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("name");

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Productos</h1>
        <Card>
          <div className="p-6 text-red-700 text-sm">
            Error al cargar los productos. Intenta de nuevo.
          </div>
        </Card>
      </div>
    );
  }

  const groupedProducts = LINE_ORDER.map((line) => ({
    line,
    products: (products ?? []).filter((product) => product.line === line),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button variant="primary">Nuevo producto</Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <Card>
          <div className="p-6 text-sm text-gray-600">
            Todavía no hay productos creados.
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedProducts.map(
            ({ line, products: lineProducts }) =>
              lineProducts.length > 0 && (
                <section key={line}>
                  <h2 className="text-lg font-semibold mb-4">{LINE_LABEL[line]}</h2>
                  <div className="space-y-4">
                    {lineProducts.map((product) => (
                      <Card key={product.id}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded bg-gray-100">
                            {product.image_path ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={supabase.storage
                                  .from("product-images")
                                  .getPublicUrl(product.image_path)
                                  .data.publicUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-600">
                                <span className="text-xs">Sin imagen</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{product.name}</h3>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                  product.is_active
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {product.is_active ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              {LINE_LABEL[product.line as ProductLine]}
                            </div>
                          </div>
                          <div className="text-sm whitespace-nowrap">
                            <span className="font-medium">${Number(product.price_usd).toFixed(2)}</span>
                            <span className="text-gray-500"> / {product.unit}</span>
                          </div>
                          <div className="text-sm whitespace-nowrap">
                            <span className="text-gray-500">Stock: </span>
                            <span className="font-medium">{product.stock}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/productos/${product.id}/editar`}>
                              <Button variant="ghost">Editar</Button>
                            </Link>
                            <ToggleActiveButton
                              productId={product.id}
                              isActive={product.is_active}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
}
