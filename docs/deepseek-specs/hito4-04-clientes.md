# Spec — Hito 4 / Tanda 4: Gestión de clientes (admin)

## Objetivo

`/admin/clientes`: listar todos los clientes registrados (con su email) y
permitir activar/suspender su cuenta. Consume el shell ya existente
(`src/app/admin/layout.tsx`); no hay que volver a montar `AdminShell`.

## Contexto y convenciones (no inventar fuera de esto)

- Server actions con `"use server"`, `createAdminClient()` de
  `@/lib/supabase/admin` para todo. Mismo patrón que
  `src/app/admin/productos/productActions.ts` y
  `src/app/admin/pedidos/orderAdminActions.ts`.
- Validación con **zod** (ya usado en las tandas anteriores).
- Código/comentarios en inglés, texto visible en español.
- Imports de componentes UI **con mayúscula exacta**:
  `@/components/ui/Button`, `@/components/ui/Card` (en la tanda anterior
  hubo un bug real por importarlos en minúscula — solo falla en Linux/Vercel,
  no en Windows local — revísalo con cuidado).
- Clases Tailwind: usa los tonos ya establecidos en el resto del admin
  (`text-gray-500`, `bg-gray-50`, `bg-green-100 text-green-700` para
  badges positivos, `bg-red-100 text-red-700` o similar para negativos —
  no uses clases tipo `text-muted-foreground`/`bg-muted`, no existen en
  el tema de este proyecto).
- **No** toques `src/middleware.ts`, `src/lib/auth/*`,
  `src/app/admin/AdminShell.tsx`, `src/app/admin/layout.tsx`,
  `src/app/admin/productos/**`, `src/app/admin/pedidos/**`.

## Tipos y esquema ya existentes

```ts
// src/lib/db/types.ts
export type CustomerStatus = "pending_verification" | "active" | "suspended";

export interface Customer {
  id: string; // FK a auth.users.id
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
  status: CustomerStatus;
  created_at: string;
}
```

No existe `CUSTOMER_STATUS_LABEL` — créalo en este mismo módulo nuevo (no
edites `src/lib/db/types.ts`, decláralo local a `src/app/admin/clientes/`).

**Sobre el email**: la tabla `customers` NO tiene columna `email` — vive
solo en `auth.users`. Para mostrarlo en la lista, usa el Admin Auth API:
`(await createAdminClient()).auth.admin.listUsers({ page: 1, perPage: 1000 })`
devuelve `{ data: { users: [{ id, email, ... }] } }`. Cruza por `id` con
cada `customer.id` (un `Map<string, string | undefined>` de `id -> email`
construido una vez es suficiente; Julsa es una pyme, no hace falta
paginar más allá de 1000 usuarios en esta tanda).

**Sobre las transiciones de estado**: en la práctica, el trigger de
registro (`handle_new_user`) crea los clientes directamente en `active`
(auto-registro sin aprobación manual, ver `docs/HANDOFF.md` §"Decisiones
de producto"). El valor `pending_verification` existe en el enum pero no
lo produce el flujo actual — puede aparecer igualmente en datos antiguos
o futuros, así que trátalo como un estado válido de solo lectura: **la
única acción que ofrece esta UI es alternar entre `active` y
`suspended`**. Si un cliente está en `pending_verification`, muestra su
badge pero no ofrezcas un botón de acción para él (no inventes qué hacer
con ese caso).

## Ficheros a crear

### 1. `src/app/admin/clientes/customerActions.ts`

`"use server"`.

```ts
export type SetStatusResult = { ok: true } | { ok: false; error: string };

export async function setCustomerStatus(
  customerId: string,
  status: "active" | "suspended",
): Promise<SetStatusResult>
```

- Valida `customerId` con `z.string().uuid()` y `status` con
  `z.enum(["active", "suspended"])`. Si falla, error legible en español.
- `createAdminClient()` → `.from("customers").update({ status }).eq("id", customerId)`.
- Si error de Supabase: `{ ok: false, error: "No se pudo actualizar el estado del cliente." }`.
- Si OK: `revalidatePath("/admin/clientes")`, `return { ok: true }`.

### 2. `src/app/admin/clientes/page.tsx`

Server component, `export const dynamic = "force-dynamic";`.

- Lee todos los clientes vía `createAdminClient()`:
  `.from("customers").select("id, company_name, contact_name, phone, location, status, created_at").order("created_at", { ascending: false })`.
- Construye el mapa de emails con `auth.admin.listUsers(...)` como se
  describe arriba.
- `CUSTOMER_STATUS_LABEL` local:
  ```ts
  const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
    pending_verification: "Pendiente de verificación",
    active: "Activo",
    suspended: "Suspendido",
  };
  ```
- Título "Clientes". Lista de `<Card>` (sigue el estilo visual de
  `src/app/admin/pedidos/page.tsx`), una por cliente, mostrando: nombre de
  empresa (`company_name`, destacado), nombre de contacto
  (`contact_name`, `text-gray-500`), email (del mapa; si no se encontró,
  omite la línea o muestra "—"), teléfono/ubicación si existen, fecha de
  alta (`created_at` con `toLocaleDateString("es-ES")`), badge de estado
  (verde `active`, rojo `suspended`, gris `pending_verification` —
  reutiliza los mismos tonos de badge que ya usan productos/pedidos).
- Botón de acción: si `status === "active"`, botón "Suspender" que llama
  `setCustomerStatus(id, "suspended")`; si `status === "suspended"`, botón
  "Reactivar" que llama `setCustomerStatus(id, "active")`; si
  `status === "pending_verification"`, no renderices ningún botón.
- Estado vacío: `<Card>` con "Todavía no hay clientes registrados." si la
  lista está vacía.

### 3. `src/app/admin/clientes/CustomerStatusButton.tsx`

Client component (`"use client"`), calco funcional de
`src/app/admin/productos/ToggleActiveButton.tsx` pero con el status
explícito en vez de un booleano:

```tsx
export function CustomerStatusButton({
  customerId,
  status,
}: {
  customerId: string;
  status: "active" | "suspended";
}) {
```

- Botón `<Button variant="ghost">`, texto "Suspender" si `status ===
  "active"`, "Reactivar" si `status === "suspended"`. `onClick` async
  llama a `setCustomerStatus(customerId, status === "active" ? "suspended" : "active")`;
  si `ok`, `router.refresh()`; si falla, muestra el error inline
  (`text-red-700 text-xs`) bajo el botón. Deshabilita mientras está
  pendiente ("Procesando...").
- Este componente solo se renderiza desde `page.tsx` cuando
  `status !== "pending_verification"` — no necesitas manejar ese caso
  dentro del componente.

## Fuera de alcance

- Conteo de pedidos por cliente (no existe ninguna consulta agrupada en
  el proyecto todavía; añadirla es trabajo aparte).
- Cualquier acción sobre `pending_verification` (no lo produce el flujo
  actual).
- Edición de datos del cliente (nombre, teléfono, ubicación) — eso es la
  tanda de "completar perfil", no esta.
- Tests (Hito 5).

## Criterios de aceptación

1. `npm run build` y `npm run lint` limpios.
2. `/admin/clientes` lista todos los clientes con empresa, contacto,
   email, fecha de alta y badge de estado.
3. Un cliente activo muestra botón "Suspender"; al pulsarlo pasa a
   suspendido sin recarga manual (`router.refresh()`) y el botón cambia a
   "Reactivar".
4. Un cliente en `pending_verification` no muestra ningún botón de acción.
5. Ningún fichero fuera de los 3 listados arriba se crea o modifica.
6. No se toca `src/middleware.ts`, `src/lib/auth/*`,
   `src/app/admin/AdminShell.tsx`, `src/app/admin/layout.tsx`,
   `src/app/admin/productos/**`, ni `src/app/admin/pedidos/**`.
