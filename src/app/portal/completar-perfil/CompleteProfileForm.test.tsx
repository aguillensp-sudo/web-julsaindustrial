import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CompleteProfileForm } from "./CompleteProfileForm";

const { mockCompleteProfile } = vi.hoisted(() => ({
  mockCompleteProfile: vi.fn(),
}));

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

vi.mock("./profileActions", () => ({
  completeProfile: mockCompleteProfile,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const customer = {
  company_name: "Empresa Test",
  contact_name: "Juan Pérez",
  phone: "555-1234",
  location: "Madrid",
};

describe("CompleteProfileForm", () => {
  beforeEach(() => {
    mockCompleteProfile.mockReset();
    mockPush.mockClear();
  });

  it("renders inputs with default values from customer", () => {
    render(<CompleteProfileForm customer={customer} />);
    expect(screen.getByLabelText(/Empresa/i)).toHaveValue("Empresa Test");
    expect(screen.getByLabelText(/Contacto/i)).toHaveValue(
      "Juan Pérez"
    );
    expect(screen.getByLabelText(/Teléfono/i)).toHaveValue("555-1234");
    expect(screen.getByLabelText(/Ubicación/i)).toHaveValue("Madrid");
  });

  it("renders empty phone input when phone is null", () => {
    render(
      <CompleteProfileForm
        customer={{ ...customer, phone: null, location: null }}
      />
    );
    expect(screen.getByLabelText(/Teléfono/i)).toHaveValue("");
    expect(screen.getByLabelText(/Ubicación/i)).toHaveValue("");
  });

  it("pushes /portal on successful submit", async () => {
    mockCompleteProfile.mockResolvedValue({ ok: true });
    render(<CompleteProfileForm customer={customer} />);

    fireEvent.change(screen.getByLabelText(/Empresa/i), {
      target: { value: "Empresa Modificada" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Guardar y continuar" }).closest("form")!
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/portal");
    });
  });

  it("shows error text and does not push on error", async () => {
    mockCompleteProfile.mockResolvedValue({
      ok: false,
      error: "Error al guardar",
    });
    render(<CompleteProfileForm customer={customer} />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Guardar y continuar" }).closest("form")!
    );

    await screen.findByText("Error al guardar");
    expect(mockPush).not.toHaveBeenCalled();
  });
});
