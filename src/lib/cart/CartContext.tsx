"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: { productId: string; name: string; unitPrice: number; quantity?: number }) => void;
  updateQty: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  subtotal: number;
  count: number;
}

const STORAGE_KEY = "julsa_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hidratación desde localStorage tras el primer render (evita mismatch SSR):
  // no hay forma de leer localStorage antes del montaje en cliente.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage corrupto o inaccesible: se ignora, el carrito arranca vacío.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = ({ productId, name, unitPrice, quantity = 1 }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { productId, name, unitPrice, quantity }];
      });
    };

    const updateQty: CartContextValue["updateQty"] = (productId, quantity) => {
      setItems((prev) => {
        if (quantity < 1) return prev.filter((i) => i.productId !== productId);
        return prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
      });
    };

    const remove: CartContextValue["remove"] = (productId) => {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    };

    const clear = () => setItems([]);

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    return { items, add, updateQty, remove, clear, subtotal, count };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
