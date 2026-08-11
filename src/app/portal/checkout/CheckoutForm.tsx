"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrderFromCart, type CheckoutResult } from "./checkoutActions";
import { CardBrands } from "@/components/ui/CardBrands";

/**
 * Finalizar pedido: resumen del carrito (leído en servidor), método de pago y
 * confirmación. El importe que se cobra lo recalcula el servidor desde
 * cart_items; este resumen es informativo.
 */
export function CheckoutForm({
  items,
  total,
}: {
  items: { name: string; quantity: number; lineTotal: number }[];
  total: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    CheckoutResult | null,
    FormData
  >(async (_prev, formData) => createOrderFromCart(formData), null);

  useEffect(() => {
    if (!state?.ok) return;
    if (state.redirectTo.startsWith("http")) {
      window.location.href = state.redirectTo;
    } else {
      router.push(state.redirectTo);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div className="p-4 rounded border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="font-bold mb-2">Resumen</h2>
        <ul className="text-sm space-y-1">
          {items.map((item) => (
            <li key={item.name} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>USD {item.lineTotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border)] font-bold">
          <span>Total</span>
          <span>USD {total.toFixed(2)}</span>
        </div>
      </div>

      <fieldset>
        <legend className="font-bold mb-2">Método de pago</legend>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--surface)] cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              defaultChecked
            />
            <div>
              <p className="font-semibold">Transferencia bancaria</p>
              <p className="text-xs text-[var(--text)]/70">
                Suba su comprobante después de confirmar.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--surface)] cursor-pointer">
            <input type="radio" name="paymentMethod" value="stripe" />
            <div>
              <p className="font-semibold">Pago con tarjeta</p>
              <p className="text-xs text-[var(--text)]/70">
                Pago inmediato y seguro a través de Stripe.
              </p>
              <CardBrands className="mt-1.5" />
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--surface)] opacity-50 cursor-not-allowed">
            <input type="radio" name="paymentMethod" value="tropipay" disabled />
            <div>
              <p className="font-semibold">
                TropiPay <span className="text-xs font-normal">— Próximamente</span>
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          id="notes"
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
        disabled={pending}
        className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 disabled:opacity-50"
      >
        {pending ? "Procesando…" : "Confirmar pedido"}
      </button>
    </form>
  );
}
