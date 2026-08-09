import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProofViewer } from "./ProofViewer";

const { mockGetProofSignedUrl } = vi.hoisted(() => ({
  mockGetProofSignedUrl: vi.fn(),
}));

vi.mock("../orderAdminActions", () => ({
  getProofSignedUrl: mockGetProofSignedUrl,
}));

describe("ProofViewer", () => {
  const filePath = "some/file/path.pdf";

  beforeEach(() => {
    mockGetProofSignedUrl.mockReset();
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a button with 'Ver comprobante'", () => {
    mockGetProofSignedUrl.mockResolvedValue({ ok: true, url: "https://signed.url" });
    render(<ProofViewer filePath={filePath} />);

    expect(
      screen.getByRole("button", { name: "Ver comprobante" })
    ).toBeInTheDocument();
  });

  it("calls getProofSignedUrl and window.open on success", async () => {
    mockGetProofSignedUrl.mockResolvedValue({ ok: true, url: "https://signed.url" });
    render(<ProofViewer filePath={filePath} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver comprobante" }));

    await waitFor(() => {
      expect(mockGetProofSignedUrl).toHaveBeenCalledWith(filePath);
    });
    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        "https://signed.url",
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  it("shows error message and does not call window.open on failure", async () => {
    const error = "No se pudo generar el enlace del comprobante.";
    mockGetProofSignedUrl.mockResolvedValue({ ok: false, error });
    render(<ProofViewer filePath={filePath} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver comprobante" }));

    expect(await screen.findByText(error)).toBeInTheDocument();
    expect(window.open).not.toHaveBeenCalled();
  });
});
