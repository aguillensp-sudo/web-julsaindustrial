import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecoverForm } from "./RecoverForm";

const { mockResetPasswordForEmail } = vi.hoisted(() => ({
  mockResetPasswordForEmail: vi.fn(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    auth: { resetPasswordForEmail: mockResetPasswordForEmail },
  }),
}));

describe("RecoverForm", () => {
  beforeEach(() => {
    mockResetPasswordForEmail.mockReset();
    mockResetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  });

  it("renders email input and submit button", () => {
    const { container } = render(<RecoverForm />);

    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Enviar enlace" })
    ).toBeInTheDocument();
  });

  it("submits email and shows status message", async () => {
    const { container } = render(<RecoverForm />);

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: "Enviar enlace" }));

    await screen.findByRole("status");

    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
      "user@example.com",
      { redirectTo: expect.stringContaining("/portal/login") }
    );
    expect(
      screen.getByRole("status")
    ).toHaveTextContent(
      "Si existe una cuenta con ese email, recibirá un mensaje para restablecer su contraseña."
    );
  });
});
