"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient as createBrowserClient } from "@/lib/supabase/browser";
import { createProduct, updateProduct, type ProductFormResult } from "./productActions";
import type { Product, ProductLine } from "@/lib/db/types";

const LINE_LABEL: Record<ProductLine, string> = {
  fuels: "Combustibles",
  energy: "Equipamiento energético",
  autoparts: "Autopartes",
  raw_materials: "Materias primas",
};

function ProductFormInner({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return isEdit ? updateProduct(formData) : createProduct(formData);
    },
    null as ProductFormResult | null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin/productos");
    }
  }, [state, router]);

  const imagePath = product?.image_path ?? null;

  const inputClasses =
    "w-full rounded border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]";
  const labelClasses = "mb-1 block text-sm font-medium text-gray-700";
  const errorClasses = "mt-1 text-xs text-red-700";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && product && (
        <input type="hidden" name="id" value={product.id} />
      )}

      <div>
        <label htmlFor="line" className={labelClasses}>
          Línea *
        </label>
        <select
          id="line"
          name="line"
          required
          defaultValue={product?.line ?? "fuels"}
          className={inputClasses}
        >
          {(Object.keys(LINE_LABEL) as ProductLine[]).map((line) => (
            <option key={line} value={line}>
              {LINE_LABEL[line]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="name" className={labelClasses}>
          Nombre *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          maxLength={200}
          defaultValue={product?.name ?? ""}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClasses}>
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={product?.description ?? ""}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="price_usd" className={labelClasses}>
            Precio (USD) *
          </label>
          <input
            id="price_usd"
            name="price_usd"
            type="number"
            required
            min="0"
            step="0.01"
            defaultValue={product?.price_usd ?? "0"}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="unit" className={labelClasses}>
            Unidad *
          </label>
          <input
            id="unit"
            name="unit"
            type="text"
            required
            minLength={1}
            maxLength={50}
            defaultValue={product?.unit ?? ""}
            placeholder="litro, unidad, kg..."
            className={inputClasses}
          />
        </div>
      </div>

      <div>
        <label htmlFor="stock" className={labelClasses}>
          Stock *
        </label>
        <input
          id="stock"
          name="stock"
          type="number"
          required
          min="0"
          step="1"
          defaultValue={product?.stock ?? "0"}
          className={inputClasses}
        />
      </div>

      <div>
        <label htmlFor="image" className={labelClasses}>
          Imagen
        </label>
        {product?.image_path && imagePath && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={createBrowserClient()
                .storage.from("product-images")
                .getPublicUrl(imagePath)
                .data.publicUrl}
              alt={product.name}
              className="h-24 w-24 rounded object-cover"
            />
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-[var(--accent-deep)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-gray-500">
          JPG, PNG o WebP. Máximo 5MB.
        </p>
      </div>

      {state && !state.ok && (
        <div className={errorClasses}>{state.error}</div>
      )}
      {state && state.ok && (
        <div className="mt-1 text-xs text-green-700">Producto guardado correctamente.</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Guardar producto"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/productos")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  return ProductFormInner({ product });
}
