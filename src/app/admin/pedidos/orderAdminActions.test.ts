import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProofSignedUrl, markReadyForDelivery } from "./orderAdminActions";

const { mockCreateAdminClient, mockGetCurrentAdmin } = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockGetCurrentAdmin: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mockCreateAdminClient }));
vi.mock("@/lib/auth/admin", () => ({ getCurrentAdmin: mockGetCurrentAdmin }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

mockGetCurrentAdmin.mockResolvedValue({ user_id: "admin-1", email: "admin@example.com" });

function createMockQueryBuilder() {
  return {
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
  };
}

describe("getProofSignedUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a signed URL successfully", async () => {
    const storage = {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://signed.url" }, error: null }),
      }),
    };
    mockCreateAdminClient.mockReturnValue({ storage });

    const result = await getProofSignedUrl("proofs/example.pdf");

    expect(result).toEqual({ ok: true, url: "https://signed.url" });
    expect(storage.from).toHaveBeenCalledWith("payment-proofs");
    expect(storage.from.mock.results[0].value.createSignedUrl).toHaveBeenCalledWith(
      "proofs/example.pdf",
      300
    );
  });

  it("should fail with empty file path", async () => {
    const result = await getProofSignedUrl("   ");

    expect(result).toEqual({ ok: false, error: "Ruta de fichero inválida." });
  });

  it("should fail when signed URL creation errors", async () => {
    const storage = {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({ data: null, error: new Error("storage error") }),
      }),
    };
    mockCreateAdminClient.mockReturnValue({ storage });

    const result = await getProofSignedUrl("proofs/example.pdf");

    expect(result).toEqual({ ok: false, error: "No se pudo generar el enlace del comprobante." });
  });

  it("should fail when signed URL is missing", async () => {
    const storage = {
      from: vi.fn().mockReturnValue({
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: null }, error: null }),
      }),
    };
    mockCreateAdminClient.mockReturnValue({ storage });

    const result = await getProofSignedUrl("proofs/example.pdf");

    expect(result).toEqual({ ok: false, error: "No se pudo generar el enlace del comprobante." });
  });
});

describe("markReadyForDelivery", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
    });
  });

  it("should mark an order as ready for delivery successfully", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({
      data: { status: "in_payment" },
      error: null,
    });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: true });
    expect(queryBuilder.update).toHaveBeenCalledWith({ status: "ready_for_delivery" });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
  });

  it("should fail with invalid order id", async () => {
    const result = await markReadyForDelivery("invalid-id");

    expect(result).toEqual({ ok: false, error: "ID de pedido inválido." });
  });

  it("should fail when order cannot be found", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: false, error: "No se pudo encontrar el pedido." });
  });

  it("should fail when fetching order errors", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({ data: null, error: new Error("db error") });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: false, error: "No se pudo encontrar el pedido." });
  });

  it("should fail when order is already ready for delivery", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({
      data: { status: "ready_for_delivery" },
      error: null,
    });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: false, error: "El pedido ya está marcado como disponible para entrega." });
  });

  it("should fail when order status is not in_payment", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({
      data: { status: "processing" },
      error: null,
    });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: false, error: "No se puede cambiar el estado del pedido." });
  });

  it("should fail when update errors", async () => {
    queryBuilder.maybeSingle.mockResolvedValue({
      data: { status: "in_payment" },
      error: null,
    });
    queryBuilder.eq
      .mockReturnValueOnce(queryBuilder)
      .mockResolvedValueOnce({ error: new Error("db error") });

    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");

    expect(result).toEqual({ ok: false, error: "No se pudo actualizar el estado del pedido." });
  });
});

describe("authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentAdmin.mockResolvedValueOnce(null);
  });

  it("getProofSignedUrl rejects non-admin callers", async () => {
    const result = await getProofSignedUrl("proofs/example.pdf");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it("markReadyForDelivery rejects non-admin callers", async () => {
    const result = await markReadyForDelivery("f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(result).toEqual({ ok: false, error: "No autorizado." });
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });
});
