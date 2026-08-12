"use client";

import { useActionState } from "react";
import { addToCart, type CartActionResult } from "../carrito/cartActions";

/**
 * Añadir al carrito desde la tarjeta del catálogo, sin entrar en la ficha.
 * Guarda en cart_items (servidor), no en el navegador.
 */
export function AddToCartButton({
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
    <form action={formAction} className="mt-2">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <button
        type="submit"
        disabled={disabled || pending}
        className="w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white text-sm font-bold px-3 py-1.5 disabled:opacity-50"
      >
        {pending ? "Añadiendo…" : state?.ok ? "Añadido ✓" : "Añadir al carrito"}
      </button>
      {state && !state.ok && (
        <p className="text-xs text-red-700 mt-1" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
