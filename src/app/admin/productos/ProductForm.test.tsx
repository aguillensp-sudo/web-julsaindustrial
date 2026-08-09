import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProductForm } from "./ProductForm";
import type { Product } from "@/lib/db/types";

const { mockCreateProduct, mockUpdateProduct } = vi.hoisted(() => ({
  mockCreateProduct: vi.fn(),
  mockUpdateProduct: vi.fn(),
}));

const { mockPush, mockRefresh } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
}));

const { mockGetPublicUrl } = vi.hoisted(() => ({
  mockGetPublicUrl: vi.fn(() => ({
    data: { publicUrl: "https://example.com/img.jpg" },
  })),
}));

vi.mock("./productActions", () => ({
  createProduct: mockCreateProduct,
  updateProduct: mockUpdateProduct,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({
    storage: {
      from: () => ({
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

const baseProduct: Product = {
  id: "prod-1",
  line: "fuels",
  name: "Diesel B",
  description: "Combustible diésel",
  image_path: "products/diesel.jpg",
  price_usd: 1.25,
  unit: "litro",
  stock: 1000,
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("ProductForm", () => {
  beforeEach(() => {
    mockCreateProduct.mockReset();
    mockUpdateProduct.mockReset();
    mockPush.mockClear();
    mockRefresh.mockClear();
  });

  it("renders in create mode with 'Guardar producto' and no hidden id field", () => {
    render(<ProductForm />);
    expect(
      screen.getByRole("button", { name: "Guardar producto" })
    ).toBeInTheDocument();
    expect(document.querySelector('input[name="id"]')).not.toBeInTheDocument();
  });

  it("renders in edit mode with 'Guardar cambios', hidden id field and image", () => {
    render(<ProductForm product={baseProduct} />);
    expect(
      screen.getByRole("button", { name: "Guardar cambios" })
    ).toBeInTheDocument();
    const hiddenId = document.querySelector(
      'input[name="id"]'
    ) as HTMLInputElement;
    expect(hiddenId).toBeInTheDocument();
    expect(hiddenId.value).toBe("prod-1");
    expect(screen.getByAltText("Diesel B")).toBeInTheDocument();
    expect(screen.getByAltText("Diesel B")).toHaveAttribute(
      "src",
      "https://example.com/img.jpg"
    );
  });

  it("on successful submit calls router.push('/admin/productos')", async () => {
    mockCreateProduct.mockResolvedValue({ ok: true, productId: "p1" });
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Producto A" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Guardar producto" }).closest("form")!
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/productos");
    });
  });

  it("on submit error shows error and does not call router.push", async () => {
    mockCreateProduct.mockResolvedValue({
      ok: false,
      error: "El nombre es obligatorio",
    });
    render(<ProductForm />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Guardar producto" }).closest("form")!
    );

    await screen.findByText("El nombre es obligatorio");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clicking Cancelar calls router.push('/admin/productos')", () => {
    render(<ProductForm />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(mockPush).toHaveBeenCalledWith("/admin/productos");
  });
});
