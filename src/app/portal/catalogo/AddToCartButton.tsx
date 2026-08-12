"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";

export function AddToCartButton({
  productId,
  name,
  unitPrice,
  disabled,
}: {
  productId: string;
  name: string;
  unitPrice: number;
  disabled?: boolean;
}) {
  const cart = useCart();
  const [added, setAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    cart.add({ productId, name, unitPrice, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className="mt-2 w-full rounded bg-[var(--accent-deep)] hover:bg-[var(--accent-deeper)] text-white text-sm font-bold px-3 py-1.5 disabled:opacity-50"
    >
      {added ? "Añadido ✓" : "Añadir al carrito"}
    </button>
  );
}
