"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { createOrderFromCart } from "./checkoutActions";

type PaymentMethod = "bank_transfer" | "stripe" | "tropipay";

export function CheckoutForm() {
  const cart = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.items.length === 0) {
    return (
      <div className="mt-6 p-6 rounded border border-[var(--border)] bg-[var(--surface)] text-sm">
        Tu carrito está vacío.{" "}
        <Link href="/portal/catalogo" className="underline">
          Ver catálogo
        </Link>
        .
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await createOrderFromCart({
      items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      paymentMethod: method,
      notes: notes || undefined,
    });

    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }

    cart.clear();

    if (result.redirectTo.startsWith("http")) {
      window.location.href = result.redirectTo;
    } else {
      router.push(result.redirectTo);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <div className="p-4 rounded border border-[var(--border)] bg-[var(--surface)]">
        <h2 className="font-bold mb-2">Resumen</h2>
        <ul className="text-sm space-y-1">
          {cart.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>USD {(item.unitPrice * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border)] font-bold">
          <span>Total</span>
          <span>USD {cart.subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-2">Método de pago</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--surface)] cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="bank_transfer"
              checked={method === "bank_transfer"}
              onChange={() => setMethod("bank_transfer")}
            />
            <div>
              <p className="font-semibold">Transferencia bancaria</p>
              <p className="text-xs text-[var(--text)]/70">
                Sube tu comprobante después de confirmar.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 rounded border border-[var(--border)] bg-[var(--surface)] cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={method === "stripe"}
              onChange={() => setMethod("stripe")}
            />
            <div>
              <p className="font-semibold">Tarjeta (Stripe)</p>
              <p className="text-xs text-[var(--text)]/70">Pago inmediato con tarjeta.</p>
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
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold mb-1">
          Observaciones (opcional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>

      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
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
