import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Juan Pérez" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Mensaje/i), {
      target: { value: "Hola, necesito información." },
    });
  };

  it("shows success message and calls fetch on successful submit", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
    });

    render(<ContactForm />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await screen.findByText(
      "Mensaje enviado. Le responderemos a la mayor brevedad."
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("/api/contacto", {
      method: "POST",
      body: expect.any(FormData),
    });
  });

  it("shows error message when fetch returns ok: false", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
    });

    render(<ContactForm />);
    fillValidForm();

    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    const status = await screen.findByText(/No se pudo enviar el mensaje/);
    expect(status).toBeInTheDocument();
  });

  it("does not call fetch and shows success when honeypot is filled", async () => {
    render(<ContactForm />);
    fillValidForm();

    const honeypot = screen.getByLabelText(/No rellenar/i) as HTMLInputElement;
    fireEvent.change(honeypot, { target: { value: "spam-bot" } });

    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await screen.findByText(
      "Mensaje enviado. Le responderemos a la mayor brevedad."
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
