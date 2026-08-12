import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { OrderForm } from "./OrderForm";
import { CartProvider, useCart } from "@/lib/cart/CartContext";

function CartPeek() {
  const { items } = useCart();
  return <div data-testid="cart-peek">{JSON.stringify(items)}</div>;
}

function renderWithCart(ui: React.ReactNode) {
  return render(
    <CartProvider>
      {ui}
      <CartPeek />
    </CartProvider>,
  );
}

describe("OrderForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds the product to the cart and shows confirmation links", async () => {
    renderWithCart(
      <OrderForm productId="prod-1" name="Producto 1" unitPrice={10} stock={5} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Añadido al carrito.");

    expect(screen.getByRole("link", { name: "Ver carrito" })).toHaveAttribute(
      "href",
      "/portal/carrito",
    );

    expect(screen.getByTestId("cart-peek")).toHaveTextContent("prod-1");
  });

  it("respects the chosen quantity when adding to cart", async () => {
    renderWithCart(
      <OrderForm productId="prod-1" name="Producto 1" unitPrice={10} stock={5} />,
    );

    const qtyInput = screen.getByLabelText("Cantidad");
    fireEvent.change(qtyInput, { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "Añadir al carrito" }));

    expect(screen.getByTestId("cart-peek")).toHaveTextContent('"quantity":3');
  });

  it("shows out-of-stock message and no form when stock is 0", () => {
    renderWithCart(
      <OrderForm productId="prod-1" name="Producto 1" unitPrice={10} stock={0} />,
    );

    expect(screen.getByText("Producto sin stock disponible.")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Añadir al carrito" }),
    ).not.toBeInTheDocument();
  });
});
