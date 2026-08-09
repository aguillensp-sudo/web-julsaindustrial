# Spec — Hito 4 / Tanda 2: Productos CRUD (admin)

## Objetivo

`/admin/productos`: listar, crear, editar y dar de baja/reactivar productos.
Incluye subida de imagen a Storage. Consume el shell ya existente
(`src/app/admin/layout.tsx` envuelve automáticamente todo lo que va bajo
`src/app/admin/`, no hay que volver a montar `AdminShell`).

## Contexto y convenciones (no inventar fuera de esto)

- Código/comentarios en inglés, texto visible en español.
- Server actions con `"use server"`, no route handlers — es la convención ya
  usada en el proyecto (`src/app/portal/mis-pedidos/proofActions.ts`,
  `src/app/portal/producto/[id]/orderActions.ts`). Validación con **zod**
  (ya se usa así en `orderActions.ts`: `schema.safeParse(...)`, result type
  discriminado `{ ok: true; ... } | { ok: false; error: string }`).
- Todas las escrituras (`insert`/`update` sobre `products`, subida a
  `product-images`) van por `createAdminClient()` de `@/lib/supabase/admin`
  (service role, bypassa RLS). Las lecturas para pintar la lista también
  pueden ir por ahí — es server-only y esta ruta ya está protegida por el
  guard de `/admin`.
- **No** toques `src/middleware.ts`, `src/lib/auth/admin.ts`,
  `src/app/admin/AdminShell.tsx`, `src/app/admin/layout.tsx` — ya existen y
  funcionan.
- **No** toques el catálogo público (`src/lib/content/catalog.ts` y las
  páginas `/combustibles`, `/autopartes`, etc.) — sigue sembrado a mano y
  fuera de alcance de este ticket.

## Tipos y esquema ya existentes

```ts
// src/lib/db/types.ts
export type ProductLine = "fuels" | "energy" | "autoparts" | "raw_materials";

export interface Product {
  id: string;
  line: ProductLine;
  name: string;
  description: string | null;
  image_path: string | null;
  price_usd: number;
  unit: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

Tabla `products` (Postgres/Supabase): columnas iguales al tipo de arriba.
`price_usd numeric(10,2) check (>= 0)`, `stock integer check (>= 0)`,
`is_active boolean not null default true`. Bucket de Storage
`product-images` (público en lectura).

**"Baja" = borrado lógico**, no DELETE. `order_items.product_id` tiene
`on delete restrict`, así que un producto con pedidos históricos no se
puede borrar físicamente sin romper esa referencia. La acción "dar de baja"
pone `is_active = false`; "reactivar" lo vuelve a `true`. El portal de
cliente ya filtra `is_active = true` en sus queries (catálogo, detalle,
creación de pedido) — no hay que tocar eso.

`createAdminClient()`:
```ts
import { createAdminClient } from "@/lib/supabase/admin";
// createAdminClient(): SupabaseClient — sin argumentos, service role.
```

## Ficheros a crear

### 1. `src/app/admin/productos/productActions.ts`

`"use server"`. Cuatro server actions:

```ts
const productSchema = z.object({
  line: z.enum(["fuels", "energy", "autoparts", "raw_materials"]),
  name: z.string().min(2, "El nombre es obligatorio").max(200),
  description: z.string().max(2000).optional(),
  price_usd: z.coerce.number().min(0, "El precio no puede ser negativo"),
  unit: z.string().min(1, "La unidad es obligatoria").max(50),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
});

export type ProductFormResult =
  | { ok: true; productId: string }
  | { ok: false; error: string };

export async function createProduct(formData: FormData): Promise<ProductFormResult>
export async function updateProduct(formData: FormData): Promise<ProductFormResult>
// formData de updateProduct incluye además "id" (uuid, validar con z.string().uuid())

export type ToggleActiveResult = { ok: true } | { ok: false; error: string };
export async function setProductActive(productId: string, isActive: boolean): Promise<ToggleActiveResult>
```

Reglas:
- `createProduct`/`updateProduct`: parsear con `productSchema` (+ `id` en el
  caso de update). Si falla, `{ ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" }`.
- Si el `FormData` trae un campo `image` (`File`) con tamaño > 0: validar
  MIME contra `["image/jpeg", "image/png", "image/webp"]` y tamaño máximo
  5MB (mismos límites de orden de magnitud que `proofActions.ts` para
  comprobantes, pero para imágenes). Si no pasa validación, devolver error
  legible en español, no lanzar excepción.
- Si hay imagen válida: subir a `product-images` con
  `supabase.storage.from("product-images").upload(path, file, { upsert: true })`,
  path = `` `${line}/${crypto.randomUUID()}.${ext}` `` (extensión de
  `file.name.split(".").pop()`). Guardar el **path** devuelto (no la URL
  firmada — el bucket es público, la URL se construye en el componente que
  lista/muestra con `supabase.storage.from("product-images").getPublicUrl(path)`).
- Si no hay imagen nueva en `updateProduct`, no tocar `image_path` existente.
- `insert`/`update` sobre `products` vía `createAdminClient()`.
- `setProductActive`: `update({ is_active: isActive }).eq("id", productId)`.
- Todas las actions terminan con `revalidatePath("/admin/productos")`.

### 2. `src/app/admin/productos/page.tsx`

Server component, `export const dynamic = "force-dynamic";`.

- Lee todos los productos (activos e inactivos) vía `createAdminClient()`,
  ordenados por `line` y luego `name`.
- Agrupa por `line` igual que hace `src/app/portal/catalogo/page.tsx`
  (mismo `LINE_LABEL` en español: Combustibles / Equipamiento energético /
  Autopartes / Materias primas — puedes redeclarar esta constante local,
  no hay un módulo compartido para ella todavía).
- Encabezado con título "Productos" y botón "Nuevo producto" (`<Button variant="primary">` envuelto en `<Link href="/admin/productos/nuevo">`).
- Para cada producto, una fila/card con: imagen (thumbnail si `image_path`,
  placeholder si no), nombre, línea, precio USD, stock, badge de estado
  (`Activo` verde / `Inactivo` gris si `!is_active`), enlace "Editar" →
  `/admin/productos/${id}/editar`, y un botón para alternar activo/inactivo
  que invoque `setProductActive` (client component pequeño aparte, ver
  punto 5, porque `page.tsx` es server component y no puede tener
  `onClick`).
- Estado vacío: si no hay productos, mensaje "Todavía no hay productos
  creados." dentro de un `<Card>`.

### 3. `src/app/admin/productos/ProductForm.tsx`

Client component (`"use client"`), reutilizable para crear y editar:

```tsx
export function ProductForm({
  product,
}: {
  product?: Product; // si viene, es modo edición; si no, modo creación
}): ReturnType<typeof ProductFormInner>
```

(el tipo de retorno exacto da igual, no lo fuerces con `JSX.Element` — el
proyecto usa React 19 y ese namespace da error de tipos; deja que TS lo
infiera, como en `AdminShell.tsx`.)

- Usa `useActionState` (patrón de `ProofUpload.tsx`) apuntando a
  `createProduct` si `!product`, a `updateProduct` si `product` existe.
  Si es edición, incluye un `<input type="hidden" name="id" value={product.id} />`.
- Campos: `line` (`<select>` con las 4 opciones + label en español:
  Combustibles/Equipamiento energético/Autopartes/Materias primas), `name`
  (text), `description` (textarea, opcional), `price_usd` (number, step
  0.01, min 0), `unit` (text, ej. "litro", "unidad"), `stock` (number, min
  0, step 1), `image` (file input, accept `image/jpeg,image/png,image/webp`).
  Si es edición y `product.image_path` existe, mostrar la imagen actual
  (usando `getPublicUrl`) sobre el input de archivo.
- No hay componentes `Input`/`Label`/`FormField` reusables en el proyecto
  todavía — usa `<input>`/`<select>`/`<textarea>`/`<label>` nativos con
  clases Tailwind inline, siguiendo el estilo visual ya usado en
  `ProofUpload.tsx` (bordes `border-[var(--border)]`, `rounded`, focus con
  `--accent`, mensajes de error en `text-red-700 text-xs`, éxito en
  `text-green-700 text-xs`).
- Botón submit: `<Button variant="primary" disabled={pending}>` con texto
  "Guardar producto" (creación) o "Guardar cambios" (edición).
- Al recibir `{ ok: true }`, redirigir a `/admin/productos` con
  `useRouter().push(...)` desde un `useEffect` sobre el estado del action
  (o el patrón que ya uses para leer el resultado de `useActionState`).

### 4. `src/app/admin/productos/nuevo/page.tsx`

Server component simple: título "Nuevo producto" + `<ProductForm />` (sin prop `product`).

### 5. `src/app/admin/productos/[id]/editar/page.tsx`

Server component, `export const dynamic = "force-dynamic";`.

- `params: Promise<{ id: string }>` (Next 16, igual que
  `src/app/portal/producto/[id]/page.tsx`).
- Busca el producto por `id` vía `createAdminClient()` (sin filtrar
  `is_active`, el admin debe poder editar productos inactivos).
- Si no existe: mensaje "Producto no encontrado." + enlace de vuelta a
  `/admin/productos`.
- Si existe: título "Editar producto" + `<ProductForm product={product} />`.

### 6. `src/app/admin/productos/ToggleActiveButton.tsx`

Client component pequeño, único con `onClick` para no forzar todo
`page.tsx` a ser client:

```tsx
"use client";
export function ToggleActiveButton({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
})
```

- Botón `<Button variant="ghost">` con texto "Dar de baja" si `isActive`,
  "Reactivar" si no. `onClick` async llama a `setProductActive(productId, !isActive)`
  y luego `router.refresh()`. Muestra un estado `pending` simple
  (deshabilita el botón mientras corre).

## Fuera de alcance

- Pedidos, clientes (tandas siguientes).
- Migrar el catálogo público a leer de `products`.
- Reordenar/paginar el listado de productos (mostrar todos sin paginación
  está bien para esta tanda).
- Tests (Hito 5).

## Criterios de aceptación

1. `npm run build` y `npm run lint` limpios.
2. `/admin/productos` lista productos agrupados por línea, con badge de
   estado activo/inactivo.
3. Crear un producto nuevo (con y sin imagen) funciona y aparece en la
   lista tras redirigir.
4. Editar un producto existente actualiza sus datos; si no se sube imagen
   nueva, conserva la anterior.
5. "Dar de baja" pone `is_active = false` y el badge cambia sin recargar
   manualmente (via `router.refresh()`); "Reactivar" lo revierte.
6. Ningún fichero fuera de los 6 listados arriba se crea o modifica.
7. No se toca `src/middleware.ts`, `src/lib/auth/*`, `src/app/admin/AdminShell.tsx`,
   `src/app/admin/layout.tsx`, ni `src/lib/content/catalog.ts`.
