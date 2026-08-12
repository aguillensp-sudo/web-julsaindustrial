import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/contacto", label: "Contacto" },
];

describe("MobileMenu", () => {
  it("starts closed, with the button announcing it", () => {
    render(<MobileMenu items={NAV} />);

    const button = screen.getByRole("button", { name: "Abrir menú" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("opens the panel with every link plus the customer access CTA", () => {
    render(<MobileMenu items={NAV} />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

    const nav = screen.getByRole("navigation", {
      name: "Navegación principal móvil",
    });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Contacto" })).toHaveAttribute(
      "href",
      "/contacto",
    );
    expect(screen.getByRole("link", { name: "Acceso clientes" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cerrar menú" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("closes when a link is followed", () => {
    render(<MobileMenu items={NAV} />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

    fireEvent.click(screen.getByRole("link", { name: "Contacto" }));

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    render(<MobileMenu items={NAV} />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menú" }));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();
  });
});
