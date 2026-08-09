import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderForm } from "./OrderForm";

const { mockCreateOrder } = vi.hoisted(() => ({
  mockCreateOrder: vi.fn(),
}));

vi.mock("./orderActions", () => ({
  createOrder: mockCreateOrder,
}));

describe("OrderForm", () => {
  beforeEach(() => {
    mockCreateOrder.mockReset();
  });

  it("shows status and link on successful order creation", async () => {
    mockCreateOrder.mockResolvedValue({ ok: true, orderId: "order-1" });

    render(<OrderForm productId="prod-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Crear pedido" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Pedido creado.");

    const link = screen.getByRole("link", { name: "Mis pedidos" });
    expect(link).toHaveAttribute("href", "/portal/mis-pedidos");
  });

  it("shows alert error and keeps form on error", async () => {
    mockCreateOrder.mockResolvedValue({
      ok: false,
      error: "Error al crear pedido",
    });

    render(<OrderForm productId="prod-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Crear pedido" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Error al crear pedido");

    expect(
      screen.getByRole("button", { name: "Crear pedido" })
    ).toBeInTheDocument();
  });

  it("renders hidden product_id input with correct value", () => {
    render(<OrderForm productId="prod-1" />);
    const hiddenInput = document.querySelector(
      'input[name="product_id"]'
    ) as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.value).toBe("prod-1");
  });
});
