import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HeroReel } from "./HeroReel";

describe("HeroReel", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders one tab per slide with the first one selected", () => {
    render(<HeroReel />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.getAttribute("aria-label"))).toEqual([
      "Combustibles",
      "Equipamientos energéticos",
      "Autopartes",
      "Materias primas",
    ]);
    expect(screen.getByRole("tab", { name: "Combustibles" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    for (const name of [
      "Equipamientos energéticos",
      "Autopartes",
      "Materias primas",
    ]) {
      expect(screen.getByRole("tab", { name })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    }
  });

  it("changes selected tab on click", () => {
    render(<HeroReel />);

    fireEvent.click(screen.getByRole("tab", { name: "Materias primas" }));

    expect(screen.getByRole("tab", { name: "Combustibles" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "Materias primas" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("auto-advances to the next slide after 5000ms", () => {
    render(<HeroReel />);

    expect(screen.getByRole("tab", { name: "Combustibles" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(
      screen.getByRole("tab", { name: "Equipamientos energéticos" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Combustibles" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });
});
