# Spec — Hito 5 / Tanda 4b: Tests de componentes cliente (botones de acción)

## Objetivo

Tests con React Testing Library + Vitest para 3 componentes cliente de
botón de acción del panel admin: `CustomerStatusButton`,
`MarkReadyButton`, `ToggleActiveButton`.

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest** (`globals: true`) + **@testing-library/react**
  (`^16.3.2`) + **@testing-library/jest-dom** (matchers ya extendidos
  globalmente vía `src/test/setup.ts`, no los reimportes).
- **`@testing-library/user-event` NO está instalado.** No lo importes.
  Usa `fireEvent` de `@testing-library/react`.
- **Hoisting:** cualquier variable externa referenciada dentro de un
  factory `vi.mock(...)` debe declararse con `vi.hoisted()`:
  ```ts
  const { mockSetCustomerStatus } = vi.hoisted(() => ({ mockSetCustomerStatus: vi.fn() }));
  vi.mock("./customerActions", () => ({ setCustomerStatus: mockSetCustomerStatus }));
  ```
- Mockea siempre `next/navigation`:
  ```ts
  const { mockPush, mockRefresh } = vi.hoisted(() => ({
    mockPush: vi.fn(),
    mockRefresh: vi.fn(),
  }));
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  }));
  ```
- Estos 3 componentes NO usan `useActionState` ni `<form>` — son botones
  con `onClick` async que llaman directamente a una server action
  (`await someAction(...)`) dentro de un handler. Se disparan con
  `fireEvent.click(button)` normal (no hace falta `fireEvent.submit`,
  ese problema solo afectaba a formularios con `useActionState`).
  Envuelve las aserciones posteriores al click en
  `await waitFor(() => expect(...))` o `await screen.findBy...`, porque
  el handler es async.
- Un fichero de test por componente: `<Nombre>.test.tsx`, junto al
  fichero que testea.
- Código/comentarios en inglés, texto de aserciones en el string
  español exacto indicado abajo.
- No instales dependencias nuevas. No modifiques `package.json` ni
  `vitest.config.ts`.

## Componentes a testear (fuente exacta, NO modificar)

### 1. `src/app/admin/clientes/CustomerStatusButton.tsx`

```ts
interface CustomerStatusButtonProps { customerId: string; status: "active" | "suspended"; }
export function CustomerStatusButton({ customerId, status }: CustomerStatusButtonProps)
```
- Importa `setCustomerStatus` de `./customerActions` — mockéalo.
  `SetStatusResult = { ok: true } | { ok: false; error: string }`.
- `handleClick`: calcula `nextStatus = status === "active" ? "suspended" : "active"`,
  llama `await setCustomerStatus(customerId, nextStatus)`.
  - Si `ok: true` → `router.refresh()` se llama.
  - Si `ok: false` → se muestra `<p>{result.error}</p>` (SIN `role="alert"`,
    búscalo con `screen.findByText(error)`), `router.refresh()` NO se llama.
- Botón (usa el componente `Button`, se renderiza como `<button>` nativo,
  `role="button"`): texto según `status` cuando NO está cargando —
  `status === "active"` → `"Suspender"`; `status === "suspended"` →
  `"Reactivar"`. Mientras `loading` → texto `"Procesando..."`.
- El botón está `disabled` mientras `loading` es `true`.

Tests mínimos:
- Con `status="active"`, el botón muestra texto `"Suspender"`.
- Con `status="suspended"`, el botón muestra texto `"Reactivar"`.
- Click con `status="active"` y mock resolviendo `{ ok: true }` →
  `setCustomerStatus` se llama con `(customerId, "suspended")`, y
  `router.refresh` se llama.
- Click con mock resolviendo `{ ok: false, error: "No se pudo actualizar el estado del cliente." }`
  → se muestra ese texto en pantalla, `router.refresh` NO se llama.

### 2. `src/app/admin/pedidos/[id]/MarkReadyButton.tsx`

```ts
export function MarkReadyButton({ orderId }: { orderId: string })
```
- Importa `markReadyForDelivery` de `../orderAdminActions` — mockéalo.
  `MarkReadyResult = { ok: true } | { ok: false; error: string }`.
- `handleClick`: `await markReadyForDelivery(orderId)`.
  - Si `ok: true` → `router.refresh()` se llama.
  - Si `ok: false` → `<p>{result.error}</p>` (sin `role`), `router.refresh`
    NO se llama.
  - **A diferencia de `CustomerStatusButton`, aquí `setIsLoading(false)`
    se ejecuta siempre al final** (tanto en éxito como en error) —
    puedes verificar que tras el error el botón vuelve a estar habilitado
    (`not.toBeDisabled()`).
- Botón: texto fijo `"Marcar como disponible para entrega"`; mientras
  `isLoading` → `"Procesando..."`. `disabled` mientras `isLoading`.

Tests mínimos:
- Render inicial muestra `"Marcar como disponible para entrega"`, botón habilitado.
- Click con mock resolviendo `{ ok: true }` → `markReadyForDelivery` se llama con `orderId`, `router.refresh` se llama.
- Click con mock resolviendo `{ ok: false, error: "No se pudo actualizar el estado del pedido." }` → se muestra ese texto, `router.refresh` NO se llama, y el botón vuelve a estar habilitado (`isLoading` vuelve a `false`).

### 3. `src/app/admin/productos/ToggleActiveButton.tsx`

```ts
export function ToggleActiveButton({ productId, isActive }: { productId: string; isActive: boolean })
```
- Importa `setProductActive` de `./productActions` — mockéalo.
  `ToggleActiveResult = { ok: true } | { ok: false; error: string }`.
- `handleClick`: `await setProductActive(productId, !isActive)`.
  - Si `ok: true` → `router.refresh()` se llama.
  - `setPending(false)` se ejecuta siempre al final (éxito o error).
  - **Este componente NO muestra ningún mensaje de error en pantalla**
    (el resultado de error se ignora salvo por `ok`) — no escribas una
    aserción de texto de error para este componente, solo verifica que
    `router.refresh` NO se llama y que el botón vuelve a estar habilitado.
- Botón: texto según `isActive` cuando no está `pending` —
  `isActive === true` → `"Dar de baja"`; `isActive === false` →
  `"Reactivar"`. Mientras `pending` → `"Procesando..."`. `disabled`
  mientras `pending`.

Tests mínimos:
- Con `isActive={true}`, el botón muestra `"Dar de baja"`.
- Con `isActive={false}`, el botón muestra `"Reactivar"`.
- Click con `isActive={true}` y mock resolviendo `{ ok: true }` →
  `setProductActive` se llama con `(productId, false)`, `router.refresh` se llama.
- Click con mock resolviendo `{ ok: false, error: "Error al cambiar el estado del producto." }`
  → `router.refresh` NO se llama, el botón vuelve a estar habilitado
  (no verifiques ningún texto de error en pantalla).

## Ficheros a crear

- `src/app/admin/clientes/CustomerStatusButton.test.tsx`
- `src/app/admin/pedidos/[id]/MarkReadyButton.test.tsx`
- `src/app/admin/productos/ToggleActiveButton.test.tsx`

## Fuera de alcance

- No toques los ficheros fuente de los componentes, ni `customerActions.ts`,
  `orderAdminActions.ts`, `productActions.ts`, `@/components/ui/Button`.
- No toques `vitest.config.ts`, `package.json`, `src/test/setup.ts`.
- No escribas tests para `AdminLogoutButton`, `LogoutButton`,
  `ProofViewer`, `HeroReel`, `DistributionMap`, `RecoverForm` — no son
  parte de esta tanda.
- No instales `@testing-library/user-event` ni ninguna otra dependencia.

## Criterios de aceptación

1. `npm run test` pasa en verde (incluyendo los tests ya existentes).
2. Los 3 componentes alcanzan cobertura cercana al 100% en líneas/ramas propias.
3. Solo se crean los 3 ficheros listados en "Ficheros a crear". Ningún
   otro fichero se crea o modifica.
4. Ningún test importa `@testing-library/user-event`.
5. `ToggleActiveButton.test.tsx` no afirma ningún texto de error en
   pantalla (el componente no lo muestra).
