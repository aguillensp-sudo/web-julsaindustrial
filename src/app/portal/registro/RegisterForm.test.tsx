import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterForm } from "./RegisterForm";

const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    auth: {
      signUp: mockSignUp,
    },
  }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  const fillForm = (container: HTMLElement, password: string) => {
    const inputs = container.querySelectorAll("input");
    fireEvent.change(inputs[0], {
      target: { value: "Empresa Test" },
    });
    fireEvent.change(inputs[1], {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(inputs[2], {
      target: { value: "test@example.com" },
    });
    fireEvent.change(inputs[3], {
      target: { value: "555-1234" },
    });
    fireEvent.change(inputs[4], {
      target: { value: "Madrid" },
    });
    fireEvent.change(inputs[5], {
      target: { value: password },
    });
  };

  it("keeps the submit button disabled with a short password", async () => {
    const { container } = render(<RegisterForm />);
    fillForm(container, "short");

    const button = screen.getByRole("button", { name: "Crear cuenta" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(mockSignUp).not.toHaveBeenCalled();
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
      "Introduzca un email válido"
    );

    fireEvent.change(inputs[2], { target: { value: "test@example.com" } });
    expect(button).toBeEnabled();
  });

  it("does not render the location field but still sends it to Supabase", async () => {
    mockSignUp.mockResolvedValue({ data: { user: {} }, error: null });

    const { container } = render(<RegisterForm />);
    expect(container.querySelector('input[name="location"]')).toHaveAttribute(
      "type",
      "hidden"
    );

    fillForm(container, "password123");
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));
    await screen.findByRole("status");

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            phone: "555-1234",
            location: "",
          }),
        }),
      })
    );
  });

  it("maps 'already registered' error to existing account message", async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: "User already registered" },
    });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Ya existe una cuenta con ese email.");
  });

  it("maps 'Password' error to requirements message", async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: "Password should be at least 8 characters" },
    });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "La contraseña no cumple los requisitos."
    );
  });

  it("maps generic error to generic message", async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: "network error" },
    });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "No se pudo crear la cuenta. Inténtelo de nuevo."
    );
  });

  it("shows status and removes form on successful signUp", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    const { container } = render(<RegisterForm />);
    fillForm(container, "password123");

    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Cuenta creada.");
    expect(container.querySelector("form")).not.toBeInTheDocument();
  });
});
