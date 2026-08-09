import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockSupabaseServerClient } from "@/test/mocks/supabaseServerClient";

const { mockCreateClient } = vi.hoisted(() => ({ mockCreateClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: mockCreateClient,
}));

import { getCurrentUser, getCurrentCustomer } from "./session";

describe("getCurrentUser", () => {
  beforeEach(() => {
    mockCreateClient.mockReset();
  });

  it("returns the user when auth.getUser() resolves with a user", async () => {
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123", email: "user@example.com" },
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentUser();

    expect(result).toEqual({ id: "user-123", email: "user@example.com" });
  });

  it("returns null when there is no session", async () => {
    const mockClient = createMockSupabaseServerClient({ user: null });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentUser();

    expect(result).toBeNull();
  });
});

describe("getCurrentCustomer", () => {
  beforeEach(() => {
    mockCreateClient.mockReset();
  });

  it("returns null without calling .from('customers') when there is no user", async () => {
    const fromMock = vi.fn();
    const mockClient = createMockSupabaseServerClient({
      user: null,
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentCustomer();

    expect(result).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns the customer row when a user exists and maybeSingle() resolves with data", async () => {
    const customerData = { id: "user-123", name: "Test Customer" };
    const fromMock = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: customerData, error: null }),
        })),
      })),
    }));
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123" },
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentCustomer();

    expect(result).toEqual(customerData);
    expect(fromMock).toHaveBeenCalledWith("customers");
  });

  it("returns null when maybeSingle() resolves without data", async () => {
    const fromMock = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    }));
    const mockClient = createMockSupabaseServerClient({
      user: { id: "user-123" },
      from: fromMock,
    });
    mockCreateClient.mockResolvedValue(mockClient);

    const result = await getCurrentCustomer();

    expect(result).toBeNull();
    expect(fromMock).toHaveBeenCalledWith("customers");
  });
});
