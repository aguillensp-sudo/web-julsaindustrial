import { describe, it, expect } from "vitest";
import { CATALOG, LINE_META, itemsByLine } from "./catalog";
import type { ProductLine } from "@/lib/db/types";

const ALL_LINES: ProductLine[] = ["fuels", "energy", "autoparts", "raw_materials"];

describe("CATALOG", () => {
  it("is not empty and every item has required non-empty fields", () => {
    expect(CATALOG.length).toBeGreaterThan(0);

    for (const item of CATALOG) {
      expect(item.slug, `slug for ${item.name}`).toBeTruthy();
      expect(item.line, `line for ${item.name}`).toBeTruthy();
      expect(item.name, `name for ${item.slug}`).toBeTruthy();
      expect(item.description, `description for ${item.slug}`).toBeTruthy();
      expect(item.visual, `visual for ${item.slug}`).toBeTruthy();
    }
  });

  it("has unique slugs", () => {
    const slugs = CATALOG.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(CATALOG.length);
  });
});

describe("itemsByLine", () => {
  it("returns only items with line 'fuels' and matches manual filter", () => {
    const result = itemsByLine("fuels");
    const manual = CATALOG.filter((item) => item.line === "fuels");

    expect(result.length).toBe(manual.length);
    expect(result.every((item) => item.line === "fuels")).toBe(true);
  });

  it("returns only items with line 'energy' and matches manual filter", () => {
    const result = itemsByLine("energy");
    const manual = CATALOG.filter((item) => item.line === "energy");

    expect(result.length).toBe(manual.length);
    expect(result.every((item) => item.line === "energy")).toBe(true);
  });

  it("returns only items with line 'autoparts' and matches manual filter", () => {
    const result = itemsByLine("autoparts");
    const manual = CATALOG.filter((item) => item.line === "autoparts");

    expect(result.length).toBe(manual.length);
    expect(result.every((item) => item.line === "autoparts")).toBe(true);
  });

  it("returns only items with line 'raw_materials' and matches manual filter", () => {
    const result = itemsByLine("raw_materials");
    const manual = CATALOG.filter((item) => item.line === "raw_materials");

    expect(result.length).toBe(manual.length);
    expect(result.every((item) => item.line === "raw_materials")).toBe(true);
  });

  it("covers all 4 ProductLine branches", () => {
    for (const line of ALL_LINES) {
      expect(itemsByLine(line).length).toBeGreaterThan(0);
    }
  });
});

describe("LINE_META", () => {
  it("has an entry for each of the 4 lines used in CATALOG with non-empty fields", () => {
    for (const line of ALL_LINES) {
      const meta = LINE_META[line];

      expect(meta, `LINE_META entry for ${line}`).toBeDefined();
      expect(meta.title).toBeTruthy();
      expect(meta.href).toBeTruthy();
      expect(meta.blurb).toBeTruthy();
    }
  });
});
