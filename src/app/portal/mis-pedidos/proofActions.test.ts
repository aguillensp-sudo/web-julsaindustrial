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

import { uploadProof } from "./proofActions";

function createMockClient() {
  return {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  };
}

function createValidFormData(overrides: Record<string, unknown> = {}) {
  const form = new FormData();
  const file = new File(["contenido"], "comprobante.pdf", {
    type: "application/pdf",
  });
  form.set("order_id", "123e4567-e89b-12d3-a456-426614174000");
  form.set("file", file);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      form.delete(key);
    } else if (value instanceof File) {
      form.set(key, value);
    } else {
      form.set(key, String(value));
    }
  }
  return form;
}

describe("uploadProof", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockReturnValue(createMockClient());
  });

  it("returns error when order_id is missing without calling createClient", async () => {
    const form = createValidFormData({ order_id: null });
    const result = await uploadProof(form);
    expect(result).toEqual({ ok: false, error: "Pedido no indicado." });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("returns error when file is missing", async () => {
    const form = createValidFormData({ file: null });
    const result = await uploadProof(form);
    expect(result).toEqual({ ok: false, error: "Seleccione un archivo." });
  });

  it("returns error when file is empty", async () => {
    const emptyFile = new File([], "vacio.pdf", { type: "application/pdf" });
    const form = createValidFormData({ file: emptyFile });
    const result = await uploadProof(form);
    expect(result).toEqual({ ok: false, error: "Seleccione un archivo." });
  });

  it("returns error when file exceeds 5MB", async () => {
    const bigFile = new File(["contenido"], "grande.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 });
    const form = createValidFormData({ file: bigFile });
    const result = await uploadProof(form);
    expect(result).toEqual({ ok: false, error: "El archivo supera los 5 MB." });
  });

  it("returns error when file type is not allowed", async () => {
    const textFile = new File(["contenido"], "nota.txt", { type: "text/plain" });
    const form = createValidFormData({ file: textFile });
    const result = await uploadProof(form);
    expect(result).toEqual({ ok: false, error: "Solo PDF, JPG o PNG." });
  });

  it("returns session error when no user is authenticated", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await uploadProof(createValidFormData());
    expect(result).toEqual({ ok: false, error: "Debe iniciar sesión." });
  });

  it("returns order not found error when order does not belong to user", async () => {
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

    const result = await uploadProof(createValidFormData());
    expect(result).toEqual({ ok: false, error: "Pedido no encontrado." });
  });

  it("returns error when storage upload fails", async () => {
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
              data: { id: "order-1" },
              error: null,
            }),
          }),
        }),
      }),
    });
    mockClient.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await uploadProof(createValidFormData());
    expect(result).toEqual({ ok: false, error: "No se pudo subir el archivo." });
  });

  it("returns error when payment_proofs insert fails", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockClient.from.mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "order-1" },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "payment_proofs") {
        return {
          insert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
        };
      }
      return {};
    });
    mockClient.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await uploadProof(createValidFormData());
    expect(result).toEqual({ ok: false, error: "No se pudo registrar el comprobante." });
  });

  it("returns success in happy path", async () => {
    const mockClient = createMockClient();
    mockClient.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mockClient.from.mockImplementation((table: string) => {
      if (table === "orders") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { id: "order-1" },
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "payment_proofs") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
    mockClient.storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });
    mockCreateClient.mockReturnValue(mockClient);

    const result = await uploadProof(createValidFormData());
    expect(result).toEqual({ ok: true });
  });
});
