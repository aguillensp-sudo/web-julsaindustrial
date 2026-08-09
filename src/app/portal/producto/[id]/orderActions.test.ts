import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCreateClient, mockRevalidatePath } = vi.hoisted(() => ({
  mockCreateClient: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import { createOrder } from "./orderActions";

function createValidFormData(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("product_id", "123e4567-e89b-12d3-a456-426614174000");
  form.set("quantity", "2");
  form.set("notes", "nota");
  for (const [key, value] of Object.entries(overrides)) {
    form.set(key, value);
  }
  return form;
}

function createMockClient() {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  };
}

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(createMockClient());
  });

  it("returns zod error for invalid input without calling createClient", async () => {
    const form = createValidFormData({ product_id: "not-a-uuid" });
    const result = await createOrder(form);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns session error when no user is authenticated", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: false, error: "Debe iniciar sesión." });
  });

  it("returns product not found error when product is null", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: false, error: "Producto no encontrado." });
  });

  it("returns insufficient stock error when stock is lower than quantity", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "prod-1", price_usd: 10, stock: 1 },
              error: null,
            }),
          }),
        }),
      }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: false, error: "No hay stock suficiente." });
  });

  it("returns error when order insert fails", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockClient.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: "prod-1", price_usd: 10, stock: 100 },
              error: null,
            }),
          }),
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
        }),
      }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: false, error: "No se pudo crear el pedido." });
  });

  it("returns error when order_items insert fails", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    mockClient.from.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "prod-1", price_usd: 10, stock: 100 },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "order-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "order_items") {
        return {
          insert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        };
      }
      return {};
    });

    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: false, error: "No se pudo añadir el producto al pedido." });
  });

  it("returns success and inserts order_item with snapshot price", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const orderItemsInsert = vi.fn().mockResolvedValue({ error: null });
    mockClient.from.mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "prod-1", price_usd: 10, stock: 100 },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "order-1" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "order_items") {
        return { insert: orderItemsInsert };
      }
      return {};
    });

    mockCreateClient.mockReturnValue(mockClient);

    const result = await createOrder(createValidFormData());
    expect(result).toEqual({ ok: true, orderId: "order-1" });
    expect(orderItemsInsert).toHaveBeenCalledWith(
      expect.objectContaining({ unit_price_usd: 10 })
    );
  });
});
