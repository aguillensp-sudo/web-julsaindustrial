# Spec — Hito 5 / Tanda 4a: Tests de componentes cliente (formularios)

## Objetivo

Tests con React Testing Library + Vitest para 7 componentes cliente
(formularios): `ProductForm`, `CompleteProfileForm`, `LoginForm`,
`RegisterForm`, `OrderForm`, `ProofUpload`, `ContactForm`.

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest** (`globals: true`) + **@testing-library/react**
  (`^16.3.2`) + **@testing-library/jest-dom** (matchers ya extendidos
  globalmente vía `src/test/setup.ts`, no los reimportes).
- **`@testing-library/user-event` NO está instalado.** No lo importes ni
  lo uses. Usa `fireEvent` de `@testing-library/react` y, para escritura
  en inputs controlados, `fireEvent.change(input, { target: { value: "..." } })`.
- **Hoisting:** cualquier variable externa referenciada dentro de un
  factory `vi.mock(...)` debe declararse con `vi.hoisted()`:
  ```ts
  const { mockCreateOrder } = vi.hoisted(() => ({ mockCreateOrder: vi.fn() }));
  vi.mock("./orderActions", () => ({ createOrder: mockCreateOrder }));
  ```
- Mockea siempre `next/navigation` cuando el componente use `useRouter`:
  ```ts
  const { mockPush, mockRefresh } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockRefresh: vi.fn(),
  }));
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  }));
  ```
- Mockea el módulo de server action que importa cada componente (no
  ejecutes la action real). Mockea `@/lib/supabase/browser` cuando el
  componente lo use (`LoginForm`, `RegisterForm`, `RecoverForm` no está
  en esta tanda).
- `useActionState` (React 19, de `"react"`) funciona igual en RTL: al
  hacer `fireEvent.submit(form)` o `fireEvent.click(submitButton)` dentro
  de un formulario con `action={formAction}`, React ejecuta la acción de
  forma asíncrona. Envuelve las aserciones post-submit en
  `await screen.findBy...` (no `getBy...`) para esperar el re-render, o
  usa `await waitFor(() => expect(...))`.
- Un fichero de test por componente: `<Nombre>.test.tsx`, junto al
  fichero que testea.
- Código/comentarios en inglés, texto de aserciones tal cual el string
  español exacto que renderiza el componente (copiado abajo).
- No instales dependencias nuevas. No modifiques `package.json` ni
  `vitest.config.ts`.

## Componentes a testear (fuente exacta, NO modificar)

### 1. `src/app/admin/productos/ProductForm.tsx`

```ts
export function ProductForm({ product }: { product?: Product })
```
`Product` (de `@/lib/db/types`): `{ id, line: ProductLine, name, description, image_path, price_usd, unit, stock, is_active, created_at, updated_at }`.
`ProductLine = "fuels" | "energy" | "autoparts" | "raw_materials"`.

- Importa `createProduct, updateProduct` de `./productActions` — mockéalos.
- Importa `createClient as createBrowserClient` de `@/lib/supabase/browser` — mockéalo devolviendo
  `{ storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: "https://example.com/img.jpg" } }) }) } }`.
- Sin `product` prop (modo crear): no hay `input[name="id"]` oculto.
  Con `product` (modo editar): sí lo hay, con `value={product.id}`.
- Campos: `#line` (select, name="line"), `#name` (input text, name="name"),
  `#description` (textarea, name="description"), `#price_usd` (input
  number, name="price_usd"), `#unit` (input text, name="unit"),
  `#stock` (input number, name="stock"), `#image` (input file, name="image").
- Botón submit: texto `"Guardar producto"` en modo crear,
  `"Guardar cambios"` en modo editar; mientras pendiente: `"Guardando..."`.
- Botón `"Cancelar"` (`type="button"`) llama a `router.push("/admin/productos")`.
- Al resolver `createProduct`/`updateProduct` con `{ ok: true, productId }`,
  un `useEffect` llama a `router.push("/admin/productos")`.
- Si `{ ok: false, error }`, se muestra `<div>{error}</div>` (no tiene
  `role`, búscalo con `screen.findByText(error)`).
- Con `product.image_path` truthy en modo editar, se renderiza un
  `<img alt={product.name} />` con la URL pública mockeada.

Tests mínimos:
- Renderiza en modo crear con botón "Guardar producto" y sin campo oculto `id`.
- Renderiza en modo editar con botón "Guardar cambios", campo oculto `id` con el valor correcto, e imagen si `image_path` existe.
- Submit exitoso (mock `createProduct` resuelve `{ ok: true, productId: "p1" }`) → `router.push` se llama con `"/admin/productos"`.
- Submit con error (mock resuelve `{ ok: false, error: "El nombre es obligatorio" }`) → se muestra el texto del error, `router.push` NO se llama.
- Click en "Cancelar" → `router.push("/admin/productos")`.

### 2. `src/app/portal/completar-perfil/CompleteProfileForm.tsx`

```ts
export function CompleteProfileForm({
  customer,
}: { customer: { company_name: string; contact_name: string; phone: string | null; location: string | null } })
```
- Importa `completeProfile` de `./profileActions` — mockéalo.
- Campos: `#company_name`, `#contact_name`, `#phone`, `#location` (todos
  input text, `defaultValue` desde `customer`, `phone`/`location`
  usan `?? ""` si vienen `null`).
- Botón submit `"Guardar y continuar"` (sin cambio de texto al pending).
- Éxito (`{ ok: true }`) → `router.push("/portal")` vía `useEffect`.
- Error (`{ ok: false, error }`) → `<p>{error}</p>`.

Tests mínimos:
- Renderiza inputs con los valores por defecto de `customer` (incl. caso `phone: null` → input vacío).
- Submit exitoso → `router.push("/portal")`.
- Submit con error → se muestra el texto del error, sin `router.push`.

### 3. `src/app/portal/login/LoginForm.tsx`

```ts
export function LoginForm()
```
- Importa `createClient` de `@/lib/supabase/browser` — mockéalo con
  `{ auth: { signInWithPassword: vi.fn() } }`.
- **Los inputs NO tienen `name` ni `id`, ni `label` ligado por `htmlFor`.**
  Selecciónalos por tipo: `container.querySelector('input[type="email"]')`
  y `container.querySelector('input[type="password"]')` (usa
  `const { container } = render(<LoginForm />)`).
- Error se muestra en `<p role="alert">{error}</p>` — usa `screen.findByRole("alert")`.
- Botón: `<button type="submit">` con texto `"Entrar"` / `"Entrando…"` en pending.
- Éxito: hace `window.location.href = redirect` (navegación completa, no
  `router.push`). Para testear sin que jsdom falle al asignar
  `location.href`, no verifiques ese efecto colateral directamente;
  basta con comprobar que `signInWithPassword` se llamó con
  `{ email, password }` y que NO aparece el `role="alert"`.
- Error: si `signInWithPassword` resuelve `{ error: { message: "..." } }`
  (cualquier mensaje), el componente muestra siempre el texto fijo
  `"Email o contraseña incorrectos."`.

Tests mínimos:
- Escribir email/password y submit → `signInWithPassword` llamado con `{ email, password }` correctos.
- Login fallido (mock resuelve `{ data: {}, error: { message: "invalid" } }`) → aparece `role="alert"` con texto `"Email o contraseña incorrectos."`.
- Login exitoso (mock resuelve `{ data: { user: {} }, error: null }`) → NO aparece `role="alert"`.

### 4. `src/app/portal/registro/RegisterForm.tsx`

```ts
export function RegisterForm()
```
- Importa `createClient` de `@/lib/supabase/browser` — mockéalo con
  `{ auth: { signUp: vi.fn() } }`.
- Inputs sin `name`/`id`, sin `htmlFor`. Selecciona por
  `container.querySelectorAll('input')` en orden: [0] Razón social
  (text), [1] Persona de contacto (text), [2] Email (type=email), [3]
  Teléfono (text), [4] Ubicación / sede (text), [5] Contraseña
  (type=password). O selecciona por tipo con `querySelector` cuando el
  tipo sea único (`input[type="email"]`, `input[type="password"]`).
- Validación cliente: password < 8 caracteres → error
  `"La contraseña debe tener al menos 8 caracteres."` SIN llamar a `signUp`.
- Error de `signUp`: mapeo exacto —
  mensaje conteniendo `"already registered"` o `"already been"` →
  `"Ya existe una cuenta con ese email."`;
  mensaje conteniendo `"Password"` →
  `"La contraseña no cumple los requisitos."`;
  cualquier otro → `"No se pudo crear la cuenta. Inténtelo de nuevo."`.
- Éxito: reemplaza el formulario por `<div role="status">` con texto
  `"Cuenta creada."`.
- Error se muestra en `<p role="alert">`.
- Botón `"Crear cuenta"` / `"Creando…"` en pending.

Tests mínimos:
- Password corto → `role="alert"` con el mensaje de longitud, `signUp` no llamado.
- `signUp` falla con mensaje que contiene `"already registered"` → alert con `"Ya existe una cuenta con ese email."`.
- `signUp` falla con mensaje que contiene `"Password"` → alert con `"La contraseña no cumple los requisitos."`.
- `signUp` falla con mensaje genérico (p.ej. `"network error"`) → alert con `"No se pudo crear la cuenta. Inténtelo de nuevo."`.
- `signUp` exitoso → aparece `role="status"` con texto `"Cuenta creada."`, formulario ya no está en el documento.

### 5. `src/app/portal/producto/[id]/OrderForm.tsx`

```ts
export function OrderForm({ productId }: { productId: string })
```
- Importa `createOrder` de `./orderActions` — mockéalo.
- Hidden `input[name="product_id"]` con `value={productId}`.
- `#quantity` (number, name="quantity", default "1"), `#notes`
  (textarea, name="notes", opcional).
- Éxito (`{ ok: true, orderId }`) → reemplaza el formulario por bloque
  `role="status"` con texto `"Pedido creado."` y un link (`role="link"`)
  con texto `"Mis pedidos"` a `/portal/mis-pedidos`.
- Error → `<p role="alert">{error}</p>`, el formulario NO se reemplaza.
- Botón `"Crear pedido"` / `"Creando…"`.

Tests mínimos:
- Submit exitoso → aparece `role="status"` con `"Pedido creado."` y el link a `/portal/mis-pedidos`.
- Submit con error → aparece `role="alert"` con el mensaje de error, el formulario sigue presente.

### 6. `src/app/portal/mis-pedidos/ProofUpload.tsx`

```ts
export function ProofUpload({ orderId }: { orderId: string })
```
- Importa `uploadProof` de `./proofActions` — mockéalo.
- Hidden `input[name="order_id"]` con `value={orderId}`.
- Input file con `aria-label="Comprobante de pago (PDF, JPG o PNG, máx 5MB)"`
  (búscalo con `screen.getByLabelText(...)`), `name="file"`.
- Éxito (`{ ok: true }`) → `<span role="status">Subido ✓</span>`.
- Error (`{ ok: false, error }`) → `<span role="alert">{error}</span>`.
- Botón `"Subir"` / `"Subiendo…"`.

Tests mínimos:
- Submit exitoso (sin necesidad de adjuntar un archivo real; el mock de
  `uploadProof` no valida el FormData) → aparece `role="status"` con `"Subido ✓"`.
- Submit con error → aparece `role="alert"` con el mensaje.

### 7. `src/app/contacto/ContactForm.tsx`

```ts
export function ContactForm()
```
- **No usa server action ni `useActionState`.** Usa `fetch("/api/contacto", { method: "POST", body: data })`
  directamente — mockea `global.fetch` con `vi.spyOn(global, "fetch")` o
  `vi.stubGlobal("fetch", vi.fn())` (restaura con `vi.unstubAllGlobals()`
  en `afterEach` si usas `stubGlobal`).
- Campos CON `htmlFor`/`id` reales: `#name` (name="name", required),
  `#phone` (name="phone", type="tel", opcional), `#email` (name="email",
  type="email", required), `#message` (textarea, name="message", required).
- Honeypot: campo oculto `name="company"` (`aria-hidden`, `tabIndex={-1}`).
  Si tiene valor no vacío al enviar, el componente pone `status="ok"` y
  hace `form.reset()` SIN llamar a `fetch`.
- `status==="ok"` → `<p role="status">Mensaje enviado. Le responderemos a la mayor brevedad.</p>`.
- `status==="error"` (fetch lanza o `res.ok` es false) → `<p role="status">No se pudo enviar el mensaje...</p>`
  (usa `screen.findAllByRole("status")` o matchea con una regex parcial
  `/No se pudo enviar el mensaje/` ya que ambos casos usan `role="status"`,
  no `role="alert"` — diferencia por el texto, no por el role).
- Botón `"Enviar"` / `"Enviando…"`.

Tests mínimos:
- Rellenar name/email/message y submit con `fetch` mockeado para resolver `{ ok: true }` → aparece texto `"Mensaje enviado. Le responderemos a la mayor brevedad."`, `fetch` fue llamado una vez con `"/api/contacto"`.
- `fetch` resuelve `{ ok: false }` → aparece texto que empieza con `"No se pudo enviar el mensaje"`.
- Rellenar el campo honeypot (`name="company"`) con un valor y hacer submit → `fetch` NO se llama, aparece igualmente el texto de éxito.

## Ficheros a crear

- `src/app/admin/productos/ProductForm.test.tsx`
- `src/app/portal/completar-perfil/CompleteProfileForm.test.tsx`
- `src/app/portal/login/LoginForm.test.tsx`
- `src/app/portal/registro/RegisterForm.test.tsx`
- `src/app/portal/producto/[id]/OrderForm.test.tsx`
- `src/app/portal/mis-pedidos/ProofUpload.test.tsx`
- `src/app/contacto/ContactForm.test.tsx`

## Fuera de alcance

- No toques los ficheros fuente de los componentes, ni `productActions.ts`,
  `profileActions.ts`, `orderActions.ts`, `proofActions.ts`,
  `@/lib/supabase/browser`, `@/components/ui/Button`.
- No toques `vitest.config.ts`, `package.json`, `src/test/setup.ts`.
- No escribas tests para `CustomerStatusButton`, `MarkReadyButton`,
  `ToggleActiveButton`, `AdminLogoutButton`, `LogoutButton`, `ProofViewer`,
  `HeroReel`, `DistributionMap`, `RecoverForm` — son otra tanda.
- No instales `@testing-library/user-event` ni ninguna otra dependencia.

## Criterios de aceptación

1. `npm run test` pasa en verde (incluyendo los tests ya existentes).
2. Los 7 componentes alcanzan cobertura cercana al 100% en líneas/ramas
   propias (mocks externos no cuentan).
3. Solo se crean los 7 ficheros listados en "Ficheros a crear". Ningún
   otro fichero se crea o modifica.
4. Ningún test importa `@testing-library/user-event`.
5. Todas las aserciones de texto usan el string español exacto indicado
   en este spec (no traducciones ni paráfrasis).
