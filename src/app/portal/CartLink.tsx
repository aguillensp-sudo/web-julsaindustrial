"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

/** Enlace al carrito con contador de artículos, para el header del portal. */
export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/portal/carrito"
      className="relative text-sm no-underline text-[var(--link)] hover:underline"
    >
      Carrito
      {count > 0 && (
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[var(--accent-deep)] text-white text-xs font-bold w-5 h-5">
          {count}
        </span>
      )}
    </Link>
  );
}
