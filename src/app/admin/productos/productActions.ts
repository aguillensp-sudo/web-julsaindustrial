"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  line: z.enum(["fuels", "energy", "autoparts", "raw_materials"]),
  name: z.string().min(2, "El nombre es obligatorio").max(200),
  description: z.string().max(2000).optional(),
  price_usd: z.coerce.number().min(0, "El precio no puede ser negativo"),
  unit: z.string().min(1, "La unidad es obligatoria").max(50),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
});

const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export type ProductFormResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

export type ToggleActiveResult = { ok: true } | { ok: false; error: string };

async function validateAndUploadImage(
  formData: FormData,
  line: string
): Promise<{ path: string } | { error: string } | null> {
  const file = formData.get("image") as File | null;

  if (!file || file.size === 0) {
    return null;
  }

  if (!VALID_MIME_TYPES.includes(file.type)) {
    return { error: "Formato de imagen no válido. Usa JPG, PNG o WebP." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "La imagen no puede superar los 5MB." };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${line}/${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { error: "Error al subir la imagen. Intenta de nuevo." };
  }

  return { path };
}

export async function createProduct(formData: FormData): Promise<ProductFormResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const rawData = {
    line: formData.get("line"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price_usd: formData.get("price_usd"),
    unit: formData.get("unit"),
    stock: formData.get("stock"),
  };

  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  const imageResult = await validateAndUploadImage(formData, data.line);

  if (imageResult && "error" in imageResult) {
    return { ok: false, error: imageResult.error };
  }

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      line: data.line,
      name: data.name,
      description: data.description || null,
      price_usd: data.price_usd,
      unit: data.unit,
      stock: data.stock,
      image_path: imageResult && "path" in imageResult ? imageResult.path : null,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: "Error al crear el producto. Intenta de nuevo." };
  }

  revalidatePath("/admin/productos");
  return { ok: true, productId: product.id };
}

export async function updateProduct(formData: FormData): Promise<ProductFormResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const idResult = z.string().uuid().safeParse(formData.get("id"));

  if (!idResult.success) {
    return { ok: false, error: "ID de producto inválido." };
  }

  const rawData = {
    line: formData.get("line"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    price_usd: formData.get("price_usd"),
    unit: formData.get("unit"),
    stock: formData.get("stock"),
  };

  const parsed = productSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const data = parsed.data;
  const imageResult = await validateAndUploadImage(formData, data.line);

  if (imageResult && "error" in imageResult) {
    return { ok: false, error: imageResult.error };
  }

  const supabase = createAdminClient();
  const updateData: Record<string, unknown> = {
    line: data.line,
    name: data.name,
    description: data.description || null,
    price_usd: data.price_usd,
    unit: data.unit,
    stock: data.stock,
  };

  if (imageResult && "path" in imageResult) {
    updateData.image_path = imageResult.path;
  }

  const { data: product, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", idResult.data)
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: "Error al actualizar el producto. Intenta de nuevo." };
  }

  revalidatePath("/admin/productos");
  return { ok: true, productId: product.id };
}

export async function setProductActive(
  productId: string,
  isActive: boolean
): Promise<ToggleActiveResult> {
  if (!(await getCurrentAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const idResult = z.string().uuid().safeParse(productId);
  if (!idResult.success) {
    return { ok: false, error: "ID de producto inválido." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", idResult.data);

  if (error) {
    return { ok: false, error: "Error al cambiar el estado del producto." };
  }

  revalidatePath("/admin/productos");
  return { ok: true };
}
