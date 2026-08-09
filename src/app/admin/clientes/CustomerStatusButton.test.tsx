import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CustomerStatusButton } from "./CustomerStatusButton";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

const { mockSetCustomerStatus } = vi.hoisted(() => ({
  mockSetCustomerStatus: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("./customerActions", () => ({
  setCustomerStatus: mockSetCustomerStatus,
}));

describe("CustomerStatusButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSetCustomerStatus.mockClear();
  });

  it('displays "Suspender" when status is "active"', () => {
    render(<CustomerStatusButton customerId="cust-1" status="active" />);
    expect(screen.getByRole("button", { name: "Suspender" })).toBeInTheDocument();
  });

  it('displays "Reactivar" when status is "suspended"', () => {
    render(<CustomerStatusButton customerId="cust-1" status="suspended" />);
    expect(screen.getByRole("button", { name: "Reactivar" })).toBeInTheDocument();
  });

  it("calls setCustomerStatus and router.refresh on success", async () => {
    mockSetCustomerStatus.mockResolvedValue({ ok: true });
    render(<CustomerStatusButton customerId="cust-1" status="active" />);

    fireEvent.click(screen.getByRole("button", { name: "Suspender" }));

    await waitFor(() => {
      expect(mockSetCustomerStatus).toHaveBeenCalledWith("cust-1", "suspended");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays error message and does not call router.refresh on failure", async () => {
    const errorMessage = "No se pudo actualizar el estado del cliente.";
    mockSetCustomerStatus.mockResolvedValue({ ok: false, error: errorMessage });
    render(<CustomerStatusButton customerId="cust-1" status="active" />);

    fireEvent.click(screen.getByRole("button", { name: "Suspender" }));

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
