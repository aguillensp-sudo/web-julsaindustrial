"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

export function CartView() {
  const cart = useCart();

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

  return (
    <div className="mt-6 space-y-4">
      <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded bg-[var(--surface)]">
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-[var(--text)]/70">
                USD {item.unitPrice.toFixed(2)} / unidad
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                cart.updateQty(item.productId, Math.max(1, Number(e.target.value) || 1))
              }
              className="w-20 rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              aria-label={`Cantidad de ${item.name}`}
            />
            <span className="w-24 text-right font-bold">
              USD {(item.unitPrice * item.quantity).toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => cart.remove(item.productId)}
              className="text-sm text-red-700 underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 rounded border border-[var(--border)] bg-[var(--surface)]">
        <span className="font-bold text-lg">Subtotal</span>
        <span className="font-extrabold text-xl text-[var(--accent-deep)]">
          USD {cart.subtotal.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between">
        <Link href="/portal/catalogo" className="text-sm no-underline">
          ← Seguir comprando
        </Link>
        <Link
          href="/portal/checkout"
          className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2 no-underline"
        >
          Ir a pagar
        </Link>
      </div>
    </div>
  );
}
