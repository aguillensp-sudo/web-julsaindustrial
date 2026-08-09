import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MarkReadyButton } from "./MarkReadyButton";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

const { mockMarkReadyForDelivery } = vi.hoisted(() => ({
  mockMarkReadyForDelivery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("../orderAdminActions", () => ({
  markReadyForDelivery: mockMarkReadyForDelivery,
}));

describe("MarkReadyButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockMarkReadyForDelivery.mockClear();
  });

  it("renders with initial label and enabled button", () => {
    render(<MarkReadyButton orderId="order-1" />);
    const button = screen.getByRole("button", { name: "Marcar como disponible para entrega" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("calls markReadyForDelivery and router.refresh on success", async () => {
    mockMarkReadyForDelivery.mockResolvedValue({ ok: true });
    render(<MarkReadyButton orderId="order-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Marcar como disponible para entrega" }));

    await waitFor(() => {
      expect(mockMarkReadyForDelivery).toHaveBeenCalledWith("order-1");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("displays error, does not call router.refresh, and re-enables button on failure", async () => {
    const errorMessage = "No se pudo actualizar el estado del pedido.";
    mockMarkReadyForDelivery.mockResolvedValue({ ok: false, error: errorMessage });
    render(<MarkReadyButton orderId="order-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Marcar como disponible para entrega" }));

    const errorElement = await screen.findByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();

    const button = await screen.findByRole("button", { name: "Marcar como disponible para entrega" });
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
