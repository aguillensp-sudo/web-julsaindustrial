import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProduct, updateProduct, setProductActive } from "./productActions";

const { mockCreateAdminClient } = vi.hoisted(() => ({ mockCreateAdminClient: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mockCreateAdminClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

function createMockQueryBuilder() {
  return {
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
}

function createMockStorage() {
  return {
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
    }),
  };
}

function createValidFormData(): FormData {
  const formData = new FormData();
  formData.set("line", "fuels");
  formData.set("name", "Gasolina 95");
  formData.set("description", "Combustible premium");
  formData.set("price_usd", "1.50");
  formData.set("unit", "litro");
  formData.set("stock", "100");
  return formData;
}

function createImageFile(type = "image/jpeg", size = 1024): File {
  const file = new File(["x"], "foto.jpg", { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("createProduct", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    storage = createMockStorage();
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
      storage,
    });
  });

  it("should create a product successfully without image", async () => {
    queryBuilder.single.mockResolvedValue({ data: { id: "product-1" }, error: null });
    const formData = createValidFormData();

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-1" });
    expect(queryBuilder.insert).toHaveBeenCalledWith({
      line: "fuels",
      name: "Gasolina 95",
      description: "Combustible premium",
      price_usd: 1.5,
      unit: "litro",
      stock: 100,
      is_active: true,
      image_path: null,
    });
  });

  it("should create a product successfully with image", async () => {
    queryBuilder.single.mockResolvedValue({ data: { id: "product-2" }, error: null });
    storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });
    const formData = createValidFormData();
    formData.set("image", createImageFile());

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-2" });
    expect(storage.from).toHaveBeenCalledWith("product-images");
    const uploadPath = storage.from.mock.results[0].value.upload.mock.calls[0][0];
    expect(uploadPath).toMatch(/^fuels\/[0-9a-f-]+\.jpg$/);
  });

  it("should fail when image upload fails", async () => {
    storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: new Error("upload failed") }),
    });
    const formData = createValidFormData();
    formData.set("image", createImageFile());

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: false, error: "Error al subir la imagen. Intenta de nuevo." });
  });

  it("should fail validation with invalid data", async () => {
    const formData = createValidFormData();
    formData.set("name", "x");

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
    expect(queryBuilder.insert).not.toHaveBeenCalled();
  });

  it("should fail when creating product returns error", async () => {
    queryBuilder.single.mockResolvedValue({ data: null, error: new Error("db error") });
    const formData = createValidFormData();

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: false, error: "Error al crear el producto. Intenta de nuevo." });
  });
});

describe("updateProduct", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    storage = createMockStorage();
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
      storage,
    });
  });

  it("should update a product successfully without new image", async () => {
    queryBuilder.single.mockResolvedValue({ data: { id: "product-3" }, error: null });
    const formData = createValidFormData();
    formData.set("id", "f47ac10b-58cc-4372-a567-0e02b2c3d479");

    const result = await updateProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-3" });
    expect(queryBuilder.update).toHaveBeenCalledWith({
      line: "fuels",
      name: "Gasolina 95",
      description: "Combustible premium",
      price_usd: 1.5,
      unit: "litro",
      stock: 100,
    });
  });

  it("should update a product successfully with new image", async () => {
    queryBuilder.single.mockResolvedValue({ data: { id: "product-4" }, error: null });
    storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });
    const formData = createValidFormData();
    formData.set("id", "f47ac10b-58cc-4372-a567-0e02b2c3d479");
    formData.set("image", createImageFile());

    const result = await updateProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-4" });
    const updateArg = queryBuilder.update.mock.calls[0][0];
    expect(updateArg.image_path).toMatch(/^fuels\/[0-9a-f-]+\.jpg$/);
  });

  it("should fail with invalid product id", async () => {
    const formData = createValidFormData();
    formData.set("id", "invalid-id");

    const result = await updateProduct(formData);

    expect(result).toEqual({ ok: false, error: "ID de producto inválido." });
  });

  it("should fail when update returns error", async () => {
    queryBuilder.single.mockResolvedValue({ data: null, error: new Error("db error") });
    const formData = createValidFormData();
    formData.set("id", "f47ac10b-58cc-4372-a567-0e02b2c3d479");

    const result = await updateProduct(formData);

    expect(result).toEqual({ ok: false, error: "Error al actualizar el producto. Intenta de nuevo." });
  });
});

describe("setProductActive", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
    });
  });

  it("should set product active status", async () => {
    queryBuilder.eq.mockResolvedValue({ error: null });

    const result = await setProductActive("product-5", false);

    expect(result).toEqual({ ok: true });
    expect(queryBuilder.update).toHaveBeenCalledWith({ is_active: false });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "product-5");
  });

  it("should fail when update returns error", async () => {
    queryBuilder.eq.mockResolvedValue({ error: new Error("db error") });

    const result = await setProductActive("product-5", true);

    expect(result).toEqual({ ok: false, error: "Error al cambiar el estado del producto." });
  });
});

describe("image validation", () => {
  let queryBuilder: ReturnType<typeof createMockQueryBuilder>;
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder = createMockQueryBuilder();
    storage = createMockStorage();
    queryBuilder.single.mockResolvedValue({ data: { id: "product-1" }, error: null });
    mockCreateAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue(queryBuilder),
      storage,
    });
  });

  it("should reject invalid mime type", async () => {
    const formData = createValidFormData();
    formData.set("image", createImageFile("image/gif"));

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: false, error: "Formato de imagen no válido. Usa JPG, PNG o WebP." });
  });

  it("should reject oversized image", async () => {
    const formData = createValidFormData();
    formData.set("image", createImageFile("image/jpeg", 5 * 1024 * 1024 + 1));

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: false, error: "La imagen no puede superar los 5MB." });
  });

  it("should accept empty image as null", async () => {
    const formData = createValidFormData();
    formData.set("image", createImageFile("image/jpeg", 0));

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-1" });
    expect(queryBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ image_path: null })
    );
  });

  it("should accept PNG images", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });
    const formData = createValidFormData();
    formData.set("image", file);
    storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-1" });
  });

  it("should accept WebP images", async () => {
    const file = new File(["x"], "foto.webp", { type: "image/webp" });
    Object.defineProperty(file, "size", { value: 1024 });
    const formData = createValidFormData();
    formData.set("image", file);
    storage.from.mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: null }),
    });

    const result = await createProduct(formData);

    expect(result).toEqual({ ok: true, productId: "product-1" });
  });
});
