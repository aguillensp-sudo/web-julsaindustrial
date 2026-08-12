import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterForm } from "./RegisterForm";

const { mockRegisterCustomer, mockSignInWithPassword } = vi.hoisted(() => ({
  mockRegisterCustomer: vi.fn(),
  mockSignInWithPassword: vi.fn(),
}));

vi.mock("./registerActions", () => ({
  registerCustomer: mockRegisterCustomer,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    auth: { signInWithPassword: mockSignInWithPassword },
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterCustomer.mockResolvedValue({ ok: true });
    mockSignInWithPassword.mockResolvedValue({ error: null });
  });

  const fillForm = (container: HTMLElement, password: string) => {
    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "Empresa Test" } });
    fireEvent.change(inputs[1], { target: { value: "Juan Pérez" } });
    fireEvent.change(inputs[2], { target: { value: "test@example.com" } });
    fireEvent.change(inputs[3], { target: { value: "555-1234" } });
    fireEvent.change(inputs[5], { target: { value: password } });
  };

  it("keeps the submit button disabled with a short password", () => {
    const { container } = render(<RegisterForm />);
    fillForm(container, "short");

    const button = screen.getByRole("button", { name: "Crear cuenta" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockRegisterCustomer).not.toHaveBeenCalled();
  });

  it("keeps the submit button disabled until the required fields are valid", () => {
    const { container } = render(<RegisterForm />);
    const inputs = container.querySelectorAll("input");
    const button = screen.getByRole("button", { name: "Crear cuenta" });

    expect(button).toBeDisabled();

    fireEvent.change(inputs[0], { target: { value: "Empresa Test" } });
    fireEvent.change(inputs[1], { target: { value: "Juan Pérez" } });
    fireEvent.change(inputs[5], { target: { value: "password123" } });
    expect(button).toBeDisabled();

    // Email con formato inválido: sigue sin habilitarse y se avisa.
    fireEvent.change(inputs[2], { target: { value: "no-es-un-email" } });
    expect(button).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Introduzca un email válido",
    );

    fireEvent.change(inputs[2], { target: { value: "test@example.com" } });
    expect(button).toBeEnabled();
  });

  it("does not render the location field but still sends it to the server", async () => {
    const { container } = render(<RegisterForm />);
    expect(container.querySelector('input[name="location"]')).toHaveAttribute(
      "type",
      "hidden",
    );

    fillForm(container, "password123");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => expect(mockRegisterCustomer).toHaveBeenCalled());
    const formData = mockRegisterCustomer.mock.calls[0][0] as FormData;
    expect(formData.get("company_name")).toBe("Empresa Test");
    expect(formData.get("phone")).toBe("555-1234");
    expect(formData.get("location")).toBe("");
  });

  it("signs the customer in right after creating the account", async () => {
    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() =>
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      }),
    );
  });

  it("shows the server error when the account cannot be created", async () => {
    mockRegisterCustomer.mockResolvedValue({
      ok: false,
      error: "Ya existe una cuenta con ese email.",
    });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Ya existe una cuenta con ese email.");
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it("falls back to the login link when the automatic sign-in fails", async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: "boom" } });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Cuenta creada.");
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });
});
