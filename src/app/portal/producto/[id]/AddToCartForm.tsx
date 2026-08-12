"use client";

import { useActionState } from "react";
import Link from "next/link";
import { addToCart, type CartActionResult } from "../../carrito/cartActions";

/**
 * Añade el producto al carrito desde la ficha. Sustituye al antiguo
 * "Crear pedido", que generaba un pedido por artículo: ahora el cliente
 * acumula artículos y finaliza un único pedido desde el carrito.
 */
export function AddToCartForm({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    CartActionResult | null,
    FormData
  >(async (_prev, formData) => addToCart(formData), null);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />
      <div>
        <label htmlFor="quantity" className="block text-sm font-semibold mb-1">
          Cantidad
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={1}
          required
          className="w-24 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-700" role="status">
          Añadido al carrito.{" "}
          <Link href="/portal/carrito" className="underline">
            Ver carrito
          </Link>
        </p>
      )}
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Añadiendo…" : "Añadir al carrito"}
      </button>
    </form>
  );
}
