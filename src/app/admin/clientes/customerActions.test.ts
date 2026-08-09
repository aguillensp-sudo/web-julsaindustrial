import { describe, it, expect, vi, beforeEach } from "vitest";
import { setCustomerStatus } from "./customerActions";

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
    update: vi.fn().mockReturnThis(),
    eq: vi.fn(),
  };
}

describe("setCustomerStatus", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
    });
  });

  it("should set customer status to active successfully", async () => {
    queryBuilder.eq.mockResolvedValue({ error: null });

    const result = await setCustomerStatus(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "active"
    );

    expect(result).toEqual({ ok: true });
    expect(queryBuilder.update).toHaveBeenCalledWith({ status: "active" });
    expect(queryBuilder.eq).toHaveBeenCalledWith(
      "id",
      "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    );
  });

  it("should set customer status to suspended successfully", async () => {
    queryBuilder.eq.mockResolvedValue({ error: null });

    const result = await setCustomerStatus(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "suspended"
    );

    expect(result).toEqual({ ok: true });
    expect(queryBuilder.update).toHaveBeenCalledWith({ status: "suspended" });
  });

  it("should fail with invalid customer id", async () => {
    const result = await setCustomerStatus("invalid-id", "active");

    expect(result).toEqual({ ok: false, error: "ID de cliente inválido." });
  });

  it("should fail with invalid status", async () => {
    const result = await setCustomerStatus(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "deleted" as unknown as "active" | "suspended"
    );

    expect(result).toEqual({ ok: false, error: "Estado inválido." });
    expect(queryBuilder.eq).not.toHaveBeenCalled();
  });

  it("should fail when update errors", async () => {
    queryBuilder.eq.mockResolvedValue({ error: new Error("db error") });

    const result = await setCustomerStatus(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "active"
    );

    expect(result).toEqual({ ok: false, error: "No se pudo actualizar el estado del cliente." });
  });

  it("rejects non-admin callers", async () => {
    mockGetCurrentAdmin.mockResolvedValueOnce(null);

    const result = await setCustomerStatus(
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "active"
    );

    expect(result).toEqual({ ok: false, error: "No autorizado." });
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });
});
