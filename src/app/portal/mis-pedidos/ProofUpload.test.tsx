import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProofUpload } from "./ProofUpload";

const { mockUploadProof } = vi.hoisted(() => ({
  mockUploadProof: vi.fn(),
}));

vi.mock("./proofActions", () => ({
  uploadProof: mockUploadProof,
}));

describe("ProofUpload", () => {
  beforeEach(() => {
    mockUploadProof.mockReset();
  });

  it("shows status on successful upload", async () => {
    mockUploadProof.mockResolvedValue({ ok: true });

    render(<ProofUpload orderId="order-1" />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Subir" }).closest("form")!
    );

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("Subido ✓");
  });

  it("shows alert on upload error", async () => {
    mockUploadProof.mockResolvedValue({
      ok: false,
      error: "Error al subir archivo",
    });

    render(<ProofUpload orderId="order-1" />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Subir" }).closest("form")!
    );

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Error al subir archivo");
  });

  it("renders hidden order_id input and file input with label", () => {
    render(<ProofUpload orderId="order-1" />);
    const hiddenInput = document.querySelector(
      'input[name="order_id"]'
    ) as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.value).toBe("order-1");

    expect(
      screen.getByLabelText(
        "Comprobante de pago (PDF, JPG o PNG, máx 5MB)"
      )
    ).toBeInTheDocument();
  });
});
