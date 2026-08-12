"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

/**
 * Formulario de la página de detalle de producto: añade al carrito
 * (no crea el pedido todavía — eso ocurre en /portal/checkout).
 */
export function OrderForm({
  productId,
  name,
  unitPrice,
  stock,
}: {
  productId: string;
  name: string;
  unitPrice: number;
  stock: number;
}) {
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (stock <= 0) {
    return (
      <p className="text-sm text-amber-700 font-semibold" role="status">
        Producto sin stock disponible.
      </p>
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    cart.add({ productId, name, unitPrice, quantity });
    setAdded(true);
  }

  if (added) {
    return (
      <div className="rounded border border-green-600 bg-green-50 p-4" role="status">
        <p className="font-bold text-green-800">Añadido al carrito.</p>
        <div className="text-sm mt-1 flex gap-3">
          <Link href="/portal/carrito" className="underline">
            Ver carrito
          </Link>
          <Link href="/portal/catalogo" className="underline">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleAdd} className="space-y-3">
      <div>
        <label htmlFor="quantity" className="block text-sm font-semibold mb-1">
          Cantidad
        </label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          max={stock}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          required
          className="w-24 rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)]"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white font-bold px-5 py-2"
      >
        Añadir al carrito
      </button>
    </form>
  );
}
