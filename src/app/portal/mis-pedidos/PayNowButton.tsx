"use client";

import { useState } from "react";

/**
 * Reintento de pago con tarjeta de un pedido ya creado: pide a /api/checkout
 * una sesión de Stripe y lleva al cliente a la pasarela.
 */
export function PayNowButton({ orderId }: { orderId: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago.");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("No se pudo iniciar el pago.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white text-xs font-bold px-3 py-1.5 disabled:opacity-50"
      >
        {pending ? "Abriendo pago…" : "Pagar con tarjeta"}
      </button>
      {error && (
        <span className="block text-xs text-red-700 mt-1" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
