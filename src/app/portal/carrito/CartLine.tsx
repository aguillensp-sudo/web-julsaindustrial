"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFromCart, setCartQuantity } from "./cartActions";

export type CartLineItem = {
  productId: string;
  quantity: number;
  name: string;
  unit: string;
  price: number;
  stock: number;
  available: boolean;
};

/**
 * Línea del carrito: permite cambiar la cantidad o quitar el producto.
 * La cantidad se guarda al confirmar (blur o Enter) para no lanzar una
 * llamada por cada pulsación.
 */
export function CartLine({ item }: { item: CartLineItem }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "No se pudo actualizar el carrito.");
        return;
      }
      router.refresh();
    });
  }

  function commitQuantity() {
    const value = Number(quantity);
    if (!Number.isInteger(value) || value < 1) {
      setQuantity(String(item.quantity));
      setError("La cantidad mínima es 1.");
      return;
    }
    if (value === item.quantity) return;
    const formData = new FormData();
    formData.set("product_id", item.productId);
    formData.set("quantity", String(value));
    run(() => setCartQuantity(formData));
  }

  function handleRemove() {
    const formData = new FormData();
    formData.set("product_id", item.productId);
    run(() => removeFromCart(formData));
  }

  const unavailable = !item.available || item.stock < item.quantity;

  return (
    <tr className="border-t border-[var(--border)] align-top">
      <td className="p-3">
        <span className="font-semibold">{item.name}</span>
        {item.unit && (
          <span className="text-[var(--text)]/70"> · {item.unit}</span>
        )}
        {unavailable && (
          <span className="block text-xs text-red-700" role="alert">
            {item.available
              ? `Solo quedan ${item.stock} unidades.`
              : "Producto no disponible."}
          </span>
        )}
        {error && (
          <span className="block text-xs text-red-700" role="alert">
            {error}
          </span>
        )}
      </td>
      <td className="p-3 text-right">USD {item.price.toFixed(2)}</td>
      <td className="p-3">
        <input
          type="number"
          min={1}
          value={quantity}
          disabled={pending}
          aria-label={`Cantidad de ${item.name}`}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={commitQuantity}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className="w-20 rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 disabled:opacity-50"
        />
      </td>
      <td className="p-3 text-right font-semibold">
        USD {(item.price * item.quantity).toFixed(2)}
      </td>
      <td className="p-3 text-right">
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          className="text-xs underline text-[var(--link)] disabled:opacity-50"
        >
          Quitar
        </button>
      </td>
    </tr>
  );
}
