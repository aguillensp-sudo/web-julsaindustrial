import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DistributionMap } from "./DistributionMap";

describe("DistributionMap", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  it("renders container and city names with default compact=false", () => {
    render(<DistributionMap />);

    expect(
      screen.getByLabelText("Red de distribución de Julsa en Cuba")
    ).toBeInTheDocument();
    expect(screen.getAllByText("La Habana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cienfuegos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Camagüey").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Holguín").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bayamo").length).toBeGreaterThan(0);
  });

  it("renders city names with compact=true", () => {
    render(<DistributionMap compact={true} />);

    expect(
      screen.getByLabelText("Red de distribución de Julsa en Cuba")
    ).toBeInTheDocument();
    expect(screen.getAllByText("La Habana").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cienfuegos").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Camagüey").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Holguín").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Bayamo").length).toBeGreaterThan(0);
  });
});
