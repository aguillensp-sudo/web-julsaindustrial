import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./LoginForm";

const { mockSignInWithPassword } = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
    },
  }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockSignInWithPassword.mockReset();
  });

  it("calls signInWithPassword with email and password on submit", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    const { container } = render(<LoginForm />);

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });

  it("shows alert with fixed message on failed login", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "invalid" },
    });

    const { container } = render(<LoginForm />);

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email o contraseña incorrectos.");
  });

  it("does not show alert on successful login", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    const { container } = render(<LoginForm />);

    const emailInput = container.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    const passwordInput = container.querySelector(
      'input[type="password"]'
    ) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalled();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
