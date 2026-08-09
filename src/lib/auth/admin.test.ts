import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseServerClient } from "@/test/mocks/supabaseServerClient";

const { mockCreateClient } = vi.hoisted(() => ({ mockCreateClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

import { getCurrentAdmin } from "./admin";

describe("getCurrentAdmin", () => {
  beforeEach(() => {
    mockCreateClient.mockReset();
  });

  it("returns null when there is no authenticated user and does not call .from('admin_users')", async () => {
    const fromMock = vi.fn();
    const mockClient = createMockSupabaseServerClient({
      user: null,
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentAdmin();

    expect(result).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns null when user exists but admin_users has no row for that user_id", async () => {
    const fromMock = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    }));
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123", email: "user@example.com" },
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentAdmin();

    expect(result).toBeNull();
    expect(fromMock).toHaveBeenCalledWith("admin_users");
  });

  it("returns { user_id, email } when user exists and admin_users has a row", async () => {
    const fromMock = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "user-123" }, error: null }),
        })),
      })),
    }));
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123", email: "admin@example.com" },
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentAdmin();

    expect(result).toEqual({
      user_id: "user-123",
      email: "admin@example.com",
    });
  });

  it("returns email: null when user.email is undefined (covers ?? null)", async () => {
    const fromMock = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: "user-123" }, error: null }),
        })),
      })),
    }));
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123" },
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentAdmin();

    expect(result).toEqual({
      user_id: "user-123",
      email: null,
    });
  });
});
