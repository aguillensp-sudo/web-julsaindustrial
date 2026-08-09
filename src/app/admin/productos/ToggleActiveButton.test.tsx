import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ToggleActiveButton } from "./ToggleActiveButton";

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

const { mockSetProductActive } = vi.hoisted(() => ({
  mockSetProductActive: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("./productActions", () => ({
  setProductActive: mockSetProductActive,
}));

describe("ToggleActiveButton", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockRefresh.mockClear();
    mockSetProductActive.mockClear();
  });

  it('displays "Dar de baja" when isActive is true', () => {
    render(<ToggleActiveButton productId="prod-1" isActive={true} />);
    expect(screen.getByRole("button", { name: "Dar de baja" })).toBeInTheDocument();
  });

  it('displays "Reactivar" when isActive is false', () => {
    render(<ToggleActiveButton productId="prod-1" isActive={false} />);
    expect(screen.getByRole("button", { name: "Reactivar" })).toBeInTheDocument();
  });

  it("calls setProductActive and router.refresh on success", async () => {
    mockSetProductActive.mockResolvedValue({ ok: true });
    render(<ToggleActiveButton productId="prod-1" isActive={true} />);

    fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));

    await waitFor(() => {
      expect(mockSetProductActive).toHaveBeenCalledWith("prod-1", false);
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("does not call router.refresh and re-enables button on failure", async () => {
    mockSetProductActive.mockResolvedValue({
      ok: false,
      error: "Error al cambiar el estado del producto.",
    });
    render(<ToggleActiveButton productId="prod-1" isActive={true} />);

    fireEvent.click(screen.getByRole("button", { name: "Dar de baja" }));

    const button = await screen.findByRole("button", { name: "Dar de baja" });
    await waitFor(() => {
      expect(mockRefresh).not.toHaveBeenCalled();
      expect(button).not.toBeDisabled();
    });
  });
});
