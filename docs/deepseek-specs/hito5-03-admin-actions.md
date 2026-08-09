# Spec — Hito 5 / Tanda 3: Tests de server actions del admin

## Objetivo

Tests unitarios de las 3 server actions del panel admin:
`productActions.ts` (`createProduct`, `updateProduct`, `setProductActive`),
`orderAdminActions.ts` (`getProofSignedUrl`, `markReadyForDelivery`),
`customerActions.ts` (`setCustomerStatus`).

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest**, `globals: true`. Mocks con `vi.fn()`/`vi.mock()`.
- **Hoisting:** cualquier variable externa referenciada dentro de un
  factory `vi.mock(...)` debe declararse con `vi.hoisted()`:
  ```ts
  const { mockCreateAdminClient } = vi.hoisted(() => ({ mockCreateAdminClient: vi.fn() }));
  vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mockCreateAdminClient }));
  ```
  Mockea también `next/cache`:
  `vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));`
  (obligatorio en TODOS los tests que ejerciten un camino que llegue a
  `revalidatePath(...)`, si no se mockea el test lanza
  `Invariant: static generation store missing in revalidatePath` en
  runtime — bug real que ya ocurrió en la tanda anterior).
- Estas 3 actions usan `createAdminClient()` de `@/lib/supabase/admin`
  (service-role, sin sesión), **no** `createClient()` de
  `@/lib/supabase/server` — es una firma **síncrona**
  (`createAdminClient(): SupabaseClient`, no `async`), así que el mock
  debe usar `mockReturnValue(...)`, no `mockResolvedValue(...)`.
- Un fichero de test por fichero fuente: `<nombre>.test.ts`, junto al
  fichero que testea.
- Código/comentarios en inglés. No instales dependencias nuevas.
- No importes tipos que el módulo fuente no reexporta — si necesitas un
  tipo de dominio, impórtalo de `@/lib/db/types`.

## Ficheros fuente a testear (NO modificar, son de referencia exacta)

### `src/app/admin/productos/productActions.ts`

```ts
"use server";
const productSchema = z.object({
  line: z.enum(["fuels", "energy", "autoparts", "raw_materials"]),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  price_usd: z.coerce.number().min(0),
  unit: z.string().min(1).max(50),
  stock: z.coerce.number().int().min(0),
});
const VALID_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export type ProductFormResult = { ok: true; productId: string } | { ok: false; error: string };
export type ToggleActiveResult = { ok: true } | { ok: false; error: string };

async function validateAndUploadImage(formData: FormData, line: string):
  Promise<{ path: string } | { error: string } | null>
export async function createProduct(formData: FormData): Promise<ProductFormResult>
export async function updateProduct(formData: FormData): Promise<ProductFormResult>
export async function setProductActive(productId: string, isActive: boolean): Promise<ToggleActiveResult>
```

Detalle de `validateAndUploadImage` (helper interno, NO exportado — se
testea indirectamente a través de `createProduct`/`updateProduct`):
- `formData.get("image")` es `File | null`. Si no hay archivo o
  `file.size === 0` → devuelve `null` (sin imagen, no es error).
- MIME no permitido → `{ error: "Formato de imagen no válido. Usa JPG, PNG o WebP." }`.
- `file.size > MAX_IMAGE_SIZE` → `{ error: "La imagen no puede superar los 5MB." }`.
- Si pasa validación: `createAdminClient().storage.from("product-images").upload(path, file, { upsert: true })`.
  Si `uploadError` → `{ error: "Error al subir la imagen. Intenta de nuevo." }`.
  Si OK → `{ path: "<line>/<uuid>.<ext>" }`.

`createProduct(formData)`:
1. Parsea con `productSchema`. Si falla → `{ ok: false, error: <primer issue> }`.
2. Llama a `validateAndUploadImage`. Si devuelve `{ error }` →
   `{ ok: false, error }`.
3. `createAdminClient().from("products").insert({...,  is_active: true, image_path: <path o null> }).select("id").single()`.
   Si `error` → `{ ok: false, error: "Error al crear el producto. Intenta de nuevo." }`.
4. Éxito → `{ ok: true, productId: product.id }` (+ `revalidatePath("/admin/productos")`).

`updateProduct(formData)`:
1. Valida `formData.get("id")` como UUID. Si no → `{ ok: false, error: "ID de producto inválido." }`.
2. Igual que `createProduct` desde el parseo del resto de campos.
3. `createAdminClient().from("products").update({...}).eq("id", id).select("id").single()`.
   `image_path` solo se incluye en el update si `validateAndUploadImage`
   devolvió `{ path }` (si no hay imagen nueva, no se toca `image_path`
   existente).
4. Éxito → `{ ok: true, productId }` (+ `revalidatePath`).

`setProductActive(productId, isActive)`:
- `createAdminClient().from("products").update({ is_active: isActive }).eq("id", productId)`.
  Si `error` → `{ ok: false, error: "Error al cambiar el estado del producto." }`.
  Éxito → `{ ok: true }` (+ `revalidatePath`).
- **No valida `productId` con zod** — no testees un caso de "UUID
  inválido" para esta función porque el código fuente no lo rechaza (no
  inventes comportamiento que no existe).

### `src/app/admin/pedidos/orderAdminActions.ts`

```ts
export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };
export async function getProofSignedUrl(filePath: string): Promise<SignedUrlResult>

export type MarkReadyResult = { ok: true } | { ok: false; error: string };
export async function markReadyForDelivery(orderId: string): Promise<MarkReadyResult>
```

`getProofSignedUrl(filePath)`:
1. `!filePath.trim()` → `{ ok: false, error: "Ruta de fichero inválida." }`.
2. `createAdminClient().storage.from("payment-proofs").createSignedUrl(filePath, 300)`.
   Si `error` o no hay `data.signedUrl` → `{ ok: false, error: "No se pudo generar el enlace del comprobante." }`.
3. Éxito → `{ ok: true, url: data.signedUrl }`.

`markReadyForDelivery(orderId)`:
1. Valida `orderId` como UUID. Si no → `{ ok: false, error: "ID de pedido inválido." }`.
2. `createAdminClient().from("orders").select("status").eq("id", id).maybeSingle()`.
   Si `error` o no hay `order` → `{ ok: false, error: "No se pudo encontrar el pedido." }`.
3. `order.status === "ready_for_delivery"` → `{ ok: false, error: "El pedido ya está marcado como disponible para entrega." }`.
4. `order.status !== "in_payment"` (y no es `ready_for_delivery`, cubierto
   arriba) → `{ ok: false, error: "No se puede cambiar el estado del pedido." }`.
5. `createAdminClient().from("orders").update({ status: "ready_for_delivery" }).eq("id", id)`.
   Si `error` → `{ ok: false, error: "No se pudo actualizar el estado del pedido." }`.
6. Éxito → `{ ok: true }` (+ dos `revalidatePath` distintos).

### `src/app/admin/clientes/customerActions.ts`

```ts
export type SetStatusResult = { ok: true } | { ok: false; error: string };
export async function setCustomerStatus(customerId: string, status: "active" | "suspended"): Promise<SetStatusResult>
```

1. Valida `customerId` como UUID. Si no → `{ ok: false, error: "ID de cliente inválido." }`.
2. Valida `status` contra el enum `["active", "suspended"]` (aunque el
   tipo TS ya lo restringe, hay una validación zod runtime — testéala
   pasando un valor fuera de tipo con `as unknown as "active" | "suspended"`
   para forzar el caso, p.ej. `"deleted"`) → `{ ok: false, error: "Estado inválido." }`.
3. `createAdminClient().from("customers").update({ status }).eq("id", customerId)`.
   Si `error` → `{ ok: false, error: "No se pudo actualizar el estado del cliente." }`.
4. Éxito → `{ ok: true }` (+ `revalidatePath`).

## Ficheros a crear

- `src/app/admin/productos/productActions.test.ts`
- `src/app/admin/pedidos/orderAdminActions.test.ts`
- `src/app/admin/clientes/customerActions.test.ts`

Para simular `File` en `createProduct`/`updateProduct`, igual que en la
tanda anterior: `new File(["x"], "foto.jpg", { type: "image/jpeg" })`, y
`Object.defineProperty(file, "size", { value: N })` para forzar tamaños
grandes sin crear buffers reales.

## Fuera de alcance

- No toques `productActions.ts`, `orderAdminActions.ts`,
  `customerActions.ts`, ni ningún fichero fuera de los 3 `.test.ts`
  listados.
- No toques `vitest.config.ts`, `package.json`, ni nada de
  `src/app/portal/**` o `src/lib/**`.
- No escribas tests de componentes React (`ProductForm.tsx`,
  `CustomerStatusButton.tsx`, `MarkReadyButton.tsx`) — son la tanda 4.

## Criterios de aceptación

1. `npm run test` pasa en verde.
2. Los 3 ficheros fuente testeados alcanzan cobertura cercana al 100%.
3. Solo se crean los 3 ficheros listados en "Ficheros a crear". Ningún
   otro fichero se crea o modifica.
4. Todo test cuyo camino llegue a una llamada real de `revalidatePath`
   tiene `next/cache` mockeado en el mismo fichero.
