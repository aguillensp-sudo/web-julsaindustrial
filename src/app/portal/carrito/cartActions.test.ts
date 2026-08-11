import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCreateClient } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { addToCart, checkout, removeFromCart, setCartQuantity } from "./cartActions";

const PRODUCT_ID = "123e4567-e89b-12d3-a456-426614174000";
const OTHER_PRODUCT_ID = "223e4567-e89b-12d3-a456-426614174000";
const USER = { id: "user-1" };

/** Cadena `select().eq()...maybeSingle()` con resultado fijo. */
function maybeSingleChain(data: unknown) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error: null });
  const eq: ReturnType<typeof vi.fn> = vi.fn(() => ({ eq, maybeSingle }));
  return { select: vi.fn(() => ({ eq, maybeSingle })) };
}

function createMockClient(user: { id: string } | null = USER) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
    from: vi.fn(),
  };
}

function formDataOf(entries: Record<string, string>) {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addToCart", () => {
  it("rejects an invalid quantity without touching Supabase", async () => {
    const result = await addToCart(
      formDataOf({ product_id: PRODUCT_ID, quantity: "0" }),
    );
    expect(result).toEqual({ ok: false, error: "La cantidad mínima es 1" });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("inserts a new line when the product is not in the cart yet", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "products") return maybeSingleChain({ id: PRODUCT_ID, stock: 10 });
      if (table === "cart_items")
        return { ...maybeSingleChain(null), insert };
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await addToCart(
      formDataOf({ product_id: PRODUCT_ID, quantity: "3" }),
    );

    expect(result).toEqual({ ok: true });
    expect(insert).toHaveBeenCalledWith({
      customer_id: USER.id,
      product_id: PRODUCT_ID,
      quantity: 3,
    });
  });

  it("adds up quantities when the product is already in the cart", async () => {
    const eqUpdate = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq: eqUpdate }));
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "products") return maybeSingleChain({ id: PRODUCT_ID, stock: 10 });
      if (table === "cart_items")
        return { ...maybeSingleChain({ id: "line-1", quantity: 2 }), update };
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await addToCart(
      formDataOf({ product_id: PRODUCT_ID, quantity: "3" }),
    );

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ quantity: 5 });
  });

  it("refuses to exceed the available stock", async () => {
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "products") return maybeSingleChain({ id: PRODUCT_ID, stock: 4 });
      if (table === "cart_items") return maybeSingleChain({ id: "line-1", quantity: 3 });
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await addToCart(
      formDataOf({ product_id: PRODUCT_ID, quantity: "2" }),
    );

    expect(result).toEqual({ ok: false, error: "No hay stock suficiente." });
  });
});

describe("setCartQuantity", () => {
  it("refuses a quantity above the stock", async () => {
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "products") return maybeSingleChain({ stock: 2 });
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await setCartQuantity(
      formDataOf({ product_id: PRODUCT_ID, quantity: "5" }),
    );

    expect(result).toEqual({ ok: false, error: "No hay stock suficiente." });
  });

  it("updates the line of the current customer", async () => {
    const eqProduct = vi.fn().mockResolvedValue({ error: null });
    const eqCustomer = vi.fn(() => ({ eq: eqProduct }));
    const update = vi.fn(() => ({ eq: eqCustomer }));
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "products") return maybeSingleChain({ stock: 10 });
      if (table === "cart_items") return { update };
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await setCartQuantity(
      formDataOf({ product_id: PRODUCT_ID, quantity: "5" }),
    );

    expect(result).toEqual({ ok: true });
    expect(update).toHaveBeenCalledWith({ quantity: 5 });
    expect(eqCustomer).toHaveBeenCalledWith("customer_id", USER.id);
    expect(eqProduct).toHaveBeenCalledWith("product_id", PRODUCT_ID);
  });
});

describe("removeFromCart", () => {
  it("rejects a product id that is not a uuid", async () => {
    const result = await removeFromCart(formDataOf({ product_id: "nope" }));
    expect(result).toEqual({ ok: false, error: "Producto no indicado." });
  });

  it("deletes the line of the current customer", async () => {
    const eqProduct = vi.fn().mockResolvedValue({ error: null });
    const eqCustomer = vi.fn(() => ({ eq: eqProduct }));
    const del = vi.fn(() => ({ eq: eqCustomer }));
    const client = createMockClient();
    client.from.mockReturnValue({ delete: del });
    mockCreateClient.mockResolvedValue(client);

    const result = await removeFromCart(formDataOf({ product_id: PRODUCT_ID }));

    expect(result).toEqual({ ok: true });
    expect(eqProduct).toHaveBeenCalledWith("product_id", PRODUCT_ID);
  });
});

describe("checkout", () => {
  function cartSelect(items: unknown[]) {
    return {
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ data: items, error: null }),
      })),
    };
  }

  it("fails when the cart is empty", async () => {
    const client = createMockClient();
    client.from.mockImplementation((table: string) =>
      table === "cart_items" ? cartSelect([]) : {},
    );
    mockCreateClient.mockResolvedValue(client);

    const result = await checkout(new FormData());
    expect(result).toEqual({ ok: false, error: "Su carrito está vacío." });
  });

  it("fails when a line has no stock left", async () => {
    const client = createMockClient();
    client.from.mockImplementation((table: string) =>
      table === "cart_items"
        ? cartSelect([
            {
              product_id: PRODUCT_ID,
              quantity: 5,
              products: { name: "Gasoil", price_usd: 10, stock: 2, is_active: true },
            },
          ])
        : {},
    );
    mockCreateClient.mockResolvedValue(client);

    const result = await checkout(new FormData());
    expect(result).toEqual({
      ok: false,
      error: "No hay stock suficiente de Gasoil.",
    });
  });

  it("creates ONE order with every cart line and empties the cart", async () => {
    const insertItems = vi.fn().mockResolvedValue({ error: null });
    const deleteEq = vi.fn().mockResolvedValue({ error: null });
    const cartDelete = vi.fn(() => ({ eq: deleteEq }));
    const orderInsert = vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({ data: { id: "order-1" }, error: null }),
      })),
    }));

    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "cart_items")
        return {
          ...cartSelect([
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
          ]),
          delete: cartDelete,
        };
      if (table === "orders") return { insert: orderInsert };
      if (table === "order_items") return { insert: insertItems };
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await checkout(formDataOf({ notes: "Entregar por la mañana" }));

    expect(result).toEqual({ ok: true, orderId: "order-1" });
    expect(orderInsert).toHaveBeenCalledTimes(1);
    expect(orderInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: USER.id,
        status: "in_payment",
        notes: "Entregar por la mañana",
      }),
    );
    // Las dos líneas del carrito van al MISMO pedido.
    expect(insertItems).toHaveBeenCalledWith([
      expect.objectContaining({ order_id: "order-1", product_id: PRODUCT_ID, quantity: 2 }),
      expect.objectContaining({
        order_id: "order-1",
        product_id: OTHER_PRODUCT_ID,
        quantity: 1,
      }),
    ]);
    expect(cartDelete).toHaveBeenCalled();
    expect(deleteEq).toHaveBeenCalledWith("customer_id", USER.id);
  });

  it("rolls back the order when the lines cannot be inserted", async () => {
    const orderDeleteEq = vi.fn().mockResolvedValue({ error: null });
    const orderDelete = vi.fn(() => ({ eq: orderDeleteEq }));
    const client = createMockClient();
    client.from.mockImplementation((table: string) => {
      if (table === "cart_items")
        return cartSelect([
          {
            product_id: PRODUCT_ID,
            quantity: 2,
            products: { name: "Gasoil", price_usd: 10, stock: 50, is_active: true },
          },
        ]);
      if (table === "orders")
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi
                .fn()
                .mockResolvedValue({ data: { id: "order-1" }, error: null }),
            })),
          })),
          delete: orderDelete,
        };
      if (table === "order_items")
        return { insert: vi.fn().mockResolvedValue({ error: { message: "boom" } }) };
      return {};
    });
    mockCreateClient.mockResolvedValue(client);

    const result = await checkout(new FormData());

    expect(result).toEqual({
      ok: false,
      error: "No se pudieron añadir los productos al pedido.",
    });
    expect(orderDeleteEq).toHaveBeenCalledWith("id", "order-1");
  });
});
