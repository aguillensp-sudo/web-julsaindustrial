"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createOrder, type CreateOrderResult } from "./orderActions";

/**
 * Formulario de pedido en la página de detalle de producto.
 * Usa useActionState para feedback inmediato del server action.
 */
export function OrderForm({ productId }: { productId: string }) {
  const [state, formAction, pending] = useActionState<
    CreateOrderResult | null,
    FormData
  >(async (_prev, formData) => createOrder(formData), null);

  if (state?.ok) {
    return (
      <div className="rounded border border-green-600 bg-green-50 p-4" role="status">
        <p className="font-bold text-green-800">Pedido creado.</p>
        <p className="text-sm mt-1">
          Para completarlo, suba su comprobante de pago en{" "}
          <Link href="/portal/mis-pedidos" className="underline">
            Mis pedidos
          </Link>
          .
        </p>
      </div>
    );
  }

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
          className="w-24 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] outline-none"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-semibold mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] outline-none"
        />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[var(--accent)] hover:bg-[var(--accent-deep)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear pedido"}
      </button>
    </form>
  );
}
