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

import { addToCart, removeFromCart, setCartQuantity } from "./cartActions";

const PRODUCT_ID = "123e4567-e89b-12d3-a456-426614174000";
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
