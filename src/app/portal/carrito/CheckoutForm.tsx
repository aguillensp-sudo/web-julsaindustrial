"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkout, type CheckoutResult } from "./cartActions";

/**
 * Finalizar pedido: convierte todo el carrito en un único pedido y lleva a
 * "Mis pedidos", donde el cliente sube el comprobante de pago.
 */
export function CheckoutForm({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    CheckoutResult | null,
    FormData
  >(async (_prev, formData) => checkout(formData), null);

  useEffect(() => {
    if (state?.ok) router.push("/portal/mis-pedidos");
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="checkout-notes" className="block text-sm font-semibold mb-1">
          Observaciones del pedido (opcional)
        </label>
        <textarea
          id="checkout-notes"
          name="notes"
          rows={2}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Creando pedido…" : "Finalizar pedido"}
      </button>
      <p className="text-xs text-[var(--text)]/70">
        El pago se realiza por transferencia: tras finalizar, suba el
        comprobante desde &quot;Mis pedidos&quot;.
      </p>
    </form>
  );
}
