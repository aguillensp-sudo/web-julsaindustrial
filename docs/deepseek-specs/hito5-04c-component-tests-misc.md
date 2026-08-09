# Spec — Hito 5 / Tanda 4c: Tests de componentes cliente restantes

## Objetivo

Tests con React Testing Library + Vitest para 6 componentes cliente
pequeños que aún no tienen cobertura: `HeroReel`, `DistributionMap`,
`AdminLogoutButton`, `LogoutButton`, `ProofViewer`, `RecoverForm`.

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest** (`globals: true`) + **@testing-library/react**
  (`^16.3.2`) + **@testing-library/jest-dom**.
- **`@testing-library/user-event` NO está instalado.** No lo importes.
  Usa `fireEvent`.
- **Hoisting:** cualquier variable externa referenciada dentro de un
  factory `vi.mock(...)` debe declararse con `vi.hoisted()`.
- Mockea `next/navigation` cuando el componente use `useRouter`:
  ```ts
  const { mockPush, mockRefresh } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockRefresh: vi.fn(),
  }));
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  }));
  ```
- Un fichero de test por componente: `<Nombre>.test.tsx`, junto al
  fichero que testea.
- Código/comentarios en inglés, texto de aserciones en el string
  español exacto indicado abajo.
- No instales dependencias nuevas. No modifiques `package.json` ni
  `vitest.config.ts`.

## Componentes a testear (fuente exacta, NO modificar)

### 1. `src/app/HeroReel.tsx`

```ts
export function HeroReel()
```
No props. `SLIDES` tiene 3 elementos con `title`: "Combustibles",
"Energía solar", "Materias primas".

- Usa `window.matchMedia("(prefers-reduced-motion: reduce)")` dentro de
  un `useEffect` para decidir si auto-avanza con `setInterval` (5000ms).
  **jsdom no implementa `matchMedia` por defecto** — debes mockearlo
  antes de renderizar en CADA test:
  ```ts
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });
  ```
  (con `matches: false`, es decir, NO reduced-motion, para que se active
  el `setInterval` y puedas testear el auto-avance con fake timers).
- Usa `vi.useFakeTimers()` / `vi.useRealTimers()` (en `beforeEach`/
  `afterEach`) para controlar el `setInterval` de 5000ms sin esperas
  reales. Envuelve `vi.advanceTimersByTime(5000)` en `act(...)` de
  `@testing-library/react` si hace falta evitar warnings de "not
  wrapped in act".
- Estructura: `role="tablist"` con `aria-label="Seleccionar slide"`
  contiene 3 `<button role="tab" aria-label={slide.title}>` (uno por
  slide, sin texto interno, solo `aria-label`). El tab con
  `aria-selected="true"` corresponde al índice actual (empieza en 0,
  "Combustibles").
- Click en un tab (`role="tab"`, `aria-label="Materias primas"`) llama
  `setIndex(2)` → ese tab pasa a `aria-selected="true"`.
- Auto-avance: tras `vi.advanceTimersByTime(5000)`, el índice avanza en
  1 (circular, `(i+1) % 3`).
- `onMouseEnter`/`onMouseLeave` en el `<section>` (selecciónalo con
  `screen.getByRole("region", ...)` NO aplica porque no tiene `role`
  explícito — usa en su lugar
  `screen.getByLabelText("Líneas de producto de Julsa Industrial")`,
  que matchea el `aria-label` del `<section aria-roledescription="carousel">`)
  pausan/reanudan el auto-avance (`paused` state) — no hace falta
  testear ese pause explícitamente si resulta complejo con fake timers,
  pero SÍ testea al menos el render inicial y el click en los tabs.

Tests mínimos:
- Render inicial: 3 `role="tab"`, el primero (`aria-label="Combustibles"`) tiene `aria-selected="true"`.
- Click en el tab `aria-label="Materias primas"` → ese tab pasa a `aria-selected="true"`, el de "Combustibles" pasa a `aria-selected="false"`.
- Con fake timers, tras avanzar 5000ms, el tab seleccionado cambia al siguiente índice (de "Combustibles" a "Energía solar").

### 2. `src/components/cuba/DistributionMap.tsx`

```ts
export function DistributionMap({ compact = false }: { compact?: boolean })
```
- Usa `useSyncExternalStore` con `window.matchMedia(...)` — mockea
  `window.matchMedia` igual que en `HeroReel` (con `addEventListener`/
  `removeEventListener` como `vi.fn()`), si no, el render falla porque
  `matchMedia` no existe en jsdom.
- Wrapper `<div aria-label="Red de distribución de Julsa en Cuba">`.
- Lista textual `<ul>` con 5 `<li>` conteniendo los nombres de nodo:
  "La Habana", "Cienfuegos", "Camagüey", "Holguín", "Bayamo" (siempre
  visibles, dual encoding — no dependen de `compact`).
- El SVG tiene `role="img"` y `aria-hidden="true"` (por tanto no forma
  parte del árbol de accesibilidad — no lo testees vía roles, solo
  comprueba que el contenedor con `aria-label` existe).

Tests mínimos:
- Render sin props (`compact` por defecto `false`): el contenedor
  `screen.getByLabelText("Red de distribución de Julsa en Cuba")`
  existe, y los 5 nombres de ciudad aparecen en el documento
  (`screen.getByText("La Habana")`, etc.).
- Render con `compact={true}`: el componente sigue renderizando los
  mismos 5 nombres (no falla).

### 3. `src/app/admin/AdminLogoutButton.tsx`

```ts
export function AdminLogoutButton()
```
- Importa `createClient as createBrowserClient` de
  `@/lib/supabase/browser` — mockéalo con
  `{ auth: { signOut: vi.fn().mockResolvedValue({ error: null }) } }`.
- Botón (vía `Button`, `role="button"`) con texto `"Cerrar sesión"`.
- Click → `await supabase.auth.signOut()`, luego
  `router.push("/portal/login")`, luego `router.refresh()` (ambos se
  llaman siempre, no hay manejo de error).

Tests mínimos:
- Render: botón con texto `"Cerrar sesión"`.
- Click → `signOut` se llama, `router.push` se llama con
  `"/portal/login"`, `router.refresh` se llama (usa
  `await waitFor(() => expect(...))`).

### 4. `src/app/portal/LogoutButton.tsx`

```ts
export function LogoutButton()
```
- Importa `createClient` de `@/lib/supabase/browser` — mockéalo igual
  que arriba.
- Botón nativo `<button>` (NO el componente `Button`, pero sigue siendo
  `role="button"`) con texto `"Cerrar sesión"`.
- Click → `signOut()`, luego `router.push("/")`, luego `router.refresh()`.

Tests mínimos:
- Render: botón con texto `"Cerrar sesión"`.
- Click → `signOut` se llama, `router.push` se llama con `"/"`,
  `router.refresh` se llama.

### 5. `src/app/admin/pedidos/[id]/ProofViewer.tsx`

```ts
export function ProofViewer({ filePath }: { filePath: string })
```
- Importa `getProofSignedUrl` de `../orderAdminActions` — mockéalo.
  `SignedUrlResult = { ok: true; url: string } | { ok: false; error: string }`.
- Botón (`Button`, `role="button"`) texto `"Ver comprobante"` /
  `"Generando..."` mientras `isLoading`.
- Click → `getProofSignedUrl(filePath)`.
  - Si `ok: true` → `window.open(result.url, "_blank", "noopener,noreferrer")`.
    Mockea `window.open` con `vi.spyOn(window, "open").mockImplementation(() => null)`.
  - Si `ok: false` → `<p>{result.error}</p>` (sin `role`, búscalo con
    `screen.findByText(error)`), `window.open` NO se llama.
  - `setIsLoading(false)` se ejecuta siempre al final.

Tests mínimos:
- Render inicial: botón con texto `"Ver comprobante"`.
- Click con mock resolviendo `{ ok: true, url: "https://signed.url" }`
  → `getProofSignedUrl` se llama con `filePath`, `window.open` se llama
  con `("https://signed.url", "_blank", "noopener,noreferrer")`.
- Click con mock resolviendo `{ ok: false, error: "No se pudo generar el enlace del comprobante." }`
  → se muestra ese texto, `window.open` NO se llama.

### 6. `src/app/portal/recuperar/RecoverForm.tsx`

```ts
export function RecoverForm()
```
- Importa `createClient` de `@/lib/supabase/browser` — mockéalo con
  `{ auth: { resetPasswordForEmail: vi.fn().mockResolvedValue({ data: {}, error: null }) } }`.
- **Es un `<form onSubmit={handleSubmit}>` con handler propio (NO
  `useActionState`)** — `fireEvent.submit(form)` o
  `fireEvent.click(submitButton)` funcionan igual aquí (no aplica el
  problema de `useActionState` visto en la tanda 4a).
- Input de email SIN `name`/`id`/`htmlFor` (label no ligado) — selecciona
  con `container.querySelector('input[type="email"]')`.
- Tras el submit, el formulario se reemplaza SIEMPRE (sin importar el
  resultado de `resetPasswordForEmail`, no hay manejo de error) por
  `<p role="status">Si existe una cuenta con ese email, recibirá un mensaje para restablecer su contraseña.</p>`.
- Botón `"Enviar enlace"` / `"Enviando…"`.

Tests mínimos:
- Render inicial: input de email presente, botón `"Enviar enlace"`.
- Rellenar el email y hacer submit → `resetPasswordForEmail` se llama con
  `(email, { redirectTo: expect.stringContaining("/portal/login") })`,
  y tras el submit aparece `role="status"` con el texto exacto de
  arriba (usa `await screen.findByRole("status")`).

## Ficheros a crear

- `src/app/HeroReel.test.tsx`
- `src/components/cuba/DistributionMap.test.tsx`
- `src/app/admin/AdminLogoutButton.test.tsx`
- `src/app/portal/LogoutButton.test.tsx`
- `src/app/admin/pedidos/[id]/ProofViewer.test.tsx`
- `src/app/portal/recuperar/RecoverForm.test.tsx`

## Fuera de alcance

- No toques los ficheros fuente de los componentes, ni
  `orderAdminActions.ts`, `@/lib/supabase/browser`,
  `@/components/ui/Button`.
- No toques `vitest.config.ts`, `package.json`, `src/test/setup.ts`.
- No escribas tests para ningún otro componente ni para `page.tsx`
  alguno (son server components async, fuera de alcance de RTL/Vitest).
- No instales `@testing-library/user-event` ni ninguna otra dependencia.

## Criterios de aceptación

1. `npm run test` pasa en verde (incluyendo los tests ya existentes).
2. Los 6 componentes alcanzan cobertura cercana al 100% en líneas/ramas
   propias.
3. Solo se crean los 6 ficheros listados en "Ficheros a crear". Ningún
   otro fichero se crea o modifica.
4. Ningún test importa `@testing-library/user-event`.
5. `HeroReel.test.tsx` y `DistributionMap.test.tsx` mockean
   `window.matchMedia` antes de renderizar (si no, el render lanza
   `TypeError: window.matchMedia is not a function` en jsdom).
