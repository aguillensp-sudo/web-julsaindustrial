import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCreateClient, mockCreateOrderCheckoutSession } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockCreateOrderCheckoutSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("@/lib/stripe", () => ({
  createOrderCheckoutSession: mockCreateOrderCheckoutSession,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ origin: "https://julsaindustrial.com" }),
}));

import { createOrderFromCart } from "./checkoutActions";

const PRODUCT_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_PRODUCT_ID = "223e4567-e89b-12d3-a456-426614174000";
const USER = { id: "user-1", email: "cliente@empresa.com" };

const TWO_LINES = [
  {
    product_id: PRODUCT_ID,
    quantity: 2,
    products: { name: "Gasoil", price_usd: 10, stock: 50, is_active: true },
  },
  {
    product_id: OTHER_PRODUCT_ID,
    quantity: 1,
    products: { name: "Batería", price_usd: 90, stock: 5, is_active: true },
  },
];

function cartSelect(items: unknown[]) {
  return {
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: items, error: null }),
      })),
    })),
  };
}

function orderInsertOk() {
  return vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null }),
    })),
  }));
}

function buildClient({
  items = TWO_LINES,
  itemsError = null as { message: string } | null,
}: { items?: unknown[]; itemsError?: { message: string } | null } = {}) {
  const orderItemsInsert = vi.fn().mockResolvedValue({ error: itemsError });
  const cartDeleteEq = vi.fn().mockResolvedValue({ error: null });
  const orderDeleteEq = vi.fn().mockResolvedValue({ error: null });
  const orderInsert = orderInsertOk();

  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: USER }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "cart_items")
        return { ...cartSelect(items), delete: vi.fn(() => ({ eq: cartDeleteEq })) };
      if (table === "orders")
        return { insert: orderInsert, delete: vi.fn(() => ({ eq: orderDeleteEq })) };
      if (table === "order_items") return { insert: orderItemsInsert };
      return {};
    }),
  };

  return { client, orderInsert, orderItemsInsert, cartDeleteEq, orderDeleteEq };
}

function formDataOf(entries: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createOrderFromCart", () => {
  it("rejects TropiPay while it is not available", async () => {
    const result = await createOrderFromCart(
      formDataOf({ paymentMethod: "tropipay" }),
    );
    expect(result).toEqual({ ok: false, error: "TropiPay aún no está disponible." });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("fails when the cart is empty", async () => {
    const { client } = buildClient({ items: [] });
    mockCreateClient.mockResolvedValue(client);

    const result = await createOrderFromCart(
      formDataOf({ paymentMethod: "bank_transfer" }),
    );
    expect(result).toEqual({ ok: false, error: "Su carrito está vacío." });
  });

  it("fails when a line has no stock left", async () => {
    const { client } = buildClient({
      items: [
        {
          product_id: PRODUCT_ID,
          quantity: 5,
          products: { name: "Gasoil", price_usd: 10, stock: 2, is_active: true },
        },
      ],
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await createOrderFromCart(
      formDataOf({ paymentMethod: "bank_transfer" }),
    );
    expect(result).toEqual({
      ok: false,
      error: "No hay stock suficiente de Gasoil.",
    });
  });

  it("creates ONE order with every cart line and empties the cart (transfer)", async () => {
    const { client, orderInsert, orderItemsInsert, cartDeleteEq } = buildClient();
    mockCreateClient.mockResolvedValue(client);

    const result = await createOrderFromCart(
      formDataOf({ paymentMethod: "bank_transfer", notes: "Entregar por la mañana" }),
    );

    expect(result).toEqual({ ok: true, redirectTo: "/portal/mis-pedidos" });
    expect(orderInsert).toHaveBeenCalledTimes(1);
    expect(orderInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: USER.id,
        payment_method: "bank_transfer",
        payment_status: "pending",
        notes: "Entregar por la mañana",
      }),
    );
    expect(orderItemsInsert).toHaveBeenCalledWith([
      expect.objectContaining({ order_id: "order-1", product_id: PRODUCT_ID, quantity: 2 }),
      expect.objectContaining({
        order_id: "order-1",
        product_id: OTHER_PRODUCT_ID,
        quantity: 1,
      }),
    ]);
    expect(cartDeleteEq).toHaveBeenCalledWith("customer_id", USER.id);
    expect(mockCreateOrderCheckoutSession).not.toHaveBeenCalled();
  });

  it("redirects to the Stripe session when paying by card", async () => {
    const { client } = buildClient();
    mockCreateClient.mockResolvedValue(client);
    mockCreateOrderCheckoutSession.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/test",
    });

    const result = await createOrderFromCart(formDataOf({ paymentMethod: "stripe" }));

    expect(result).toEqual({
      ok: true,
      redirectTo: "https://checkout.stripe.com/c/pay/test",
    });
    // Los importes se calculan en servidor desde el precio de catálogo.
    expect(mockCreateOrderCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        email: USER.email,
        lineItems: [
          { name: "Gasoil", unitAmountCents: 1000, quantity: 2 },
          { name: "Batería", unitAmountCents: 9000, quantity: 1 },
        ],
      }),
    );
  });

  it("keeps the order when Stripe fails, so the customer can retry", async () => {
    const { client } = buildClient();
    mockCreateClient.mockResolvedValue(client);
    mockCreateOrderCheckoutSession.mockRejectedValue(new Error("stripe down"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await createOrderFromCart(formDataOf({ paymentMethod: "stripe" }));

    expect(result.ok).toBe(false);
    expect(result).toEqual(
      expect.objectContaining({
        error: expect.stringContaining("Reinténtelo desde Mis pedidos"),
      }),
    );
    consoleError.mockRestore();
  });

  it("rolls back the order when the lines cannot be inserted", async () => {
    const { client, orderDeleteEq } = buildClient({ itemsError: { message: "boom" } });
    mockCreateClient.mockResolvedValue(client);

    const result = await createOrderFromCart(
      formDataOf({ paymentMethod: "bank_transfer" }),
    );

    expect(result).toEqual({
      ok: false,
      error: "No se pudieron añadir los productos al pedido.",
    });
    expect(orderDeleteEq).toHaveBeenCalledWith("id", "order-1");
  });
});
