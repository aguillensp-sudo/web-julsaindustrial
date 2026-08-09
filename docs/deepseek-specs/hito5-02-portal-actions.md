# Spec — Hito 5 / Tanda 2: Tests de server actions del portal

## Objetivo

Tests unitarios de las 3 server actions del portal de cliente
(`orderActions.ts`, `proofActions.ts`) y la route handler pública
(`api/contacto/route.ts`).

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest** (`globals: true`, no hace falta importar
  `describe`/`it`/`expect`). Mocks con `vi.fn()`/`vi.mock()`, nunca `jest`.
- **Importante sobre hoisting:** si el factory de `vi.mock(...)` referencia
  una variable declarada con `const` fuera del factory, usa
  `vi.hoisted(() => ({ ... }))` para declararla, o vitest lanza
  `ReferenceError: Cannot access '...' before initialization`. Patrón
  correcto (ya usado en el proyecto, en
  `src/lib/auth/session.test.ts`):
  ```ts
  const { mockCreateClient } = vi.hoisted(() => ({ mockCreateClient: vi.fn() }));
  vi.mock("@/lib/supabase/server", () => ({ createClient: mockCreateClient }));
  ```
- Un fichero de test por fichero fuente: `<nombre>.test.ts`, junto al
  fichero que testea.
- Código/comentarios en inglés.
- No instales dependencias nuevas.
- **No importes tipos que el módulo fuente no reexporta.** Por ejemplo,
  `orderActions.ts` no reexporta ningún tipo de `@/lib/db/types`; si un
  test necesita un tipo de dominio, impórtalo directamente desde
  `@/lib/db/types`, nunca desde el fichero de la action.
- Todos los tests de sesión (`supabase.auth.getUser()`) y de tabla
  (`supabase.from(...).select().eq().maybeSingle()` /
  `.insert().select().single()`) deben mockear el cliente encadenable
  igual que en `src/lib/auth/session.test.ts` y `admin.test.ts` (léelos
  como referencia de estilo si los encuentras en el repo — usan
  `vi.fn(() => ({ select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue(...) })) })) }))`
  para encadenar).

## Ficheros fuente a testear (NO modificar, son de referencia exacta)

### `src/app/portal/producto/[id]/orderActions.ts`

```ts
"use server";
const schema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(9999),
  notes: z.string().max(2000).optional(),
});
export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; error: string };
export async function createOrder(formData: FormData): Promise<CreateOrderResult>
```

Flujo real (para diseñar los mocks del cliente Supabase en cada test):
1. Parsea `formData` con zod. Si falla → `{ ok: false, error: <primer issue> }`.
2. `createClient()` → `supabase.auth.getUser()`. Si no hay `user` →
   `{ ok: false, error: "Debe iniciar sesión." }`.
3. `supabase.from("products").select("id, price_usd, stock").eq("id", product_id).eq("is_active", true).maybeSingle()`.
   Si `error` o no hay `product` → `{ ok: false, error: "Producto no encontrado." }`.
4. Si `product.stock < quantity` → `{ ok: false, error: "No hay stock suficiente." }`.
5. `supabase.from("orders").insert({...}).select("id").single()`. Si falla
   o no hay `order` → `{ ok: false, error: "No se pudo crear el pedido." }`.
6. `supabase.from("order_items").insert({...})`. Si `error` →
   `{ ok: false, error: "No se pudo añadir el producto al pedido." }`.
7. Éxito → `{ ok: true, orderId: order.id }` (y llama a
   `revalidatePath("/portal/mis-pedidos")`, mockea `next/cache` con
   `vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))`, no hace
   falta asertar sobre esa llamada salvo que sea trivial).

Casos a cubrir en `orderActions.test.ts`:
- Input inválido (p.ej. `product_id` no-UUID) → devuelve el mensaje de
  zod, sin llamar a `createClient()`.
- Sin sesión → `"Debe iniciar sesión."`.
- Producto no encontrado (`maybeSingle()` devuelve `data: null`) →
  `"Producto no encontrado."`.
- Stock insuficiente (`product.stock < quantity`) →
  `"No hay stock suficiente."`.
- Fallo al insertar `orders` → `"No se pudo crear el pedido."`.
- Fallo al insertar `order_items` → `"No se pudo añadir el producto al pedido."`.
- Camino feliz → `{ ok: true, orderId: "<id>" }`, y verifica que
  `order_items.insert` fue llamado con `unit_price_usd` igual al
  `price_usd` del producto (snapshot de precio, es la regla de negocio
  crítica de este módulo).

### `src/app/portal/mis-pedidos/proofActions.ts`

```ts
"use server";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png"];
export type UploadProofResult = { ok: true } | { ok: false; error: string };
export async function uploadProof(formData: FormData): Promise<UploadProofResult>
```

Flujo real:
1. `orderId = formData.get("order_id")`, `file = formData.get("file")`.
2. Sin `orderId` → `"Pedido no indicado."`.
3. Sin `file` o `file.size === 0` → `"Seleccione un archivo."`.
4. `file.size > MAX_BYTES` → `"El archivo supera los 5 MB."`.
5. `!ALLOWED.includes(file.type)` → `"Solo PDF, JPG o PNG."`.
6. Sin sesión → `"Debe iniciar sesión."`.
7. `supabase.from("orders").select("id").eq("id", orderId).eq("customer_id", user.id).maybeSingle()`.
   Sin `order` → `"Pedido no encontrado."`.
8. `supabase.storage.from("payment-proofs").upload(path, file, { upsert: false })`.
   Si `error` → `"No se pudo subir el archivo."`.
9. `supabase.from("payment_proofs").insert({ order_id, file_path })`. Si
   `error` → `"No se pudo registrar el comprobante."`.
10. Éxito → `{ ok: true }`.

Para simular `File` en jsdom/Vitest, construye instancias reales:
`new File(["contenido"], "comprobante.pdf", { type: "application/pdf" })`
(disponible globalmente en el entorno `jsdom` configurado). Para
controlar `file.size` en el caso ">5MB" sin crear un buffer real enorme,
usa `Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 })`
sobre la instancia de `File` ya creada.

El mock del cliente Supabase para este fichero necesita además
`supabase.storage.from(bucket).upload(...)` — añade esa rama al mock ad
hoc en el test (no hace falta tocar el helper compartido
`src/test/mocks/supabaseServerClient.ts` de la tanda anterior si no
encaja; puedes construir el mock del cliente directamente en este test
con un objeto plano `{ auth: {...}, from: vi.fn(), storage: { from: vi.fn() } }`).

Casos a cubrir en `proofActions.test.ts`:
- Sin `order_id` → `"Pedido no indicado."`, sin llamar a `createClient()`.
- Sin archivo o archivo vacío → `"Seleccione un archivo."`.
- Archivo > 5MB → `"El archivo supera los 5 MB."`.
- Tipo MIME no permitido (p.ej. `text/plain`) → `"Solo PDF, JPG o PNG."`.
- Sin sesión → `"Debe iniciar sesión."`.
- Pedido no encontrado / no pertenece al usuario → `"Pedido no encontrado."`.
- Fallo al subir a Storage → `"No se pudo subir el archivo."`.
- Fallo al insertar en `payment_proofs` → `"No se pudo registrar el comprobante."`.
- Camino feliz → `{ ok: true }`.

### `src/app/api/contacto/route.ts`

```ts
export async function POST(request: Request)
```
Route handler (no server action) — recibe `Request`, devuelve
`NextResponse.json(...)`. Construye la request de test con
`new Request("http://localhost/api/contacto", { method: "POST", body: <FormData> })`.

Flujo real:
1. `payload = Object.fromEntries(await request.formData())`. Si falla el
   parseo → `NextResponse.json({ error: "bad_request" }, { status: 400 })`.
2. Valida con zod (`name` min 2, `email` formato válido, `message` min 5,
   `phone`/`company` opcionales). Si falla →
   `NextResponse.json({ error: "validation", issues: ... }, { status: 422 })`.
3. Honeypot: si `company` viene relleno (trim no vacío) →
   `NextResponse.json({ ok: true })` (sin más efectos, "éxito" fingido).
4. Si todo OK → `NextResponse.json({ ok: true })`.

Casos a cubrir en `route.test.ts` (mismo directorio que `route.ts`):
- FormData válida (sin `company`) → status 200, body `{ ok: true }`.
- FormData con `name` demasiado corto → status 422, body con
  `error: "validation"`.
- FormData con `email` inválido → status 422.
- FormData con `company` (honeypot) relleno → status 200, body
  `{ ok: true }` (verifica que el "éxito" se devuelve igual, es el
  comportamiento intencional anti-spam, no un bug).

Para construir la `FormData` de test:
```ts
const form = new FormData();
form.set("name", "Juan Pérez");
form.set("email", "juan@example.com");
form.set("message", "Mensaje de prueba suficientemente largo");
const request = new Request("http://localhost/api/contacto", { method: "POST", body: form });
```

## Fuera de alcance

- No toques `orderActions.ts`, `proofActions.ts`, `route.ts`, ni ningún
  fichero fuera de los 3 `.test.ts` listados.
- No toques `src/test/mocks/supabaseServerClient.ts` de la tanda
  anterior (puedes leerlo como referencia de estilo, pero no es
  obligatorio usarlo si no encaja con `storage.from`).
- No toques `vitest.config.ts`, `package.json`, ni ningún fichero de
  `src/app/admin/**`.
- No escribas tests de componentes React (`OrderForm.tsx`,
  `ProofUpload.tsx`, `ContactForm.tsx`) — son la tanda 4.

## Criterios de aceptación

1. `npm run test` pasa en verde.
2. Los 3 ficheros fuente testeados alcanzan cobertura cercana al 100%.
3. Solo se crean `orderActions.test.ts`, `proofActions.test.ts` y
   `route.test.ts` (junto a sus respectivos ficheros fuente). Ningún
   otro fichero se crea o modifica.
4. Todo mock de módulo usa `vi.hoisted()` si referencia una variable
   externa al factory (evita el bug de hoisting de la tanda anterior).
