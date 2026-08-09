# Spec — Hito 4 / Tanda 5: Completar perfil (portal cliente)

## Objetivo

`/portal/completar-perfil`: pantalla a la que se redirige automáticamente
al cliente cuando su perfil quedó incompleto tras el registro (bug
conocido: el `user_metadata` del signup no siempre persiste a tiempo para
el trigger, ver `docs/HANDOFF.md` §4.2). El guard que hace la redirección
**ya existe** (`src/app/portal/page.tsx` redirige aquí si
`!customer.profile_completed`) — esta tanda es solo la pantalla y su
acción de guardado.

## Contexto y convenciones (no inventar fuera de esto)

- Server action con `"use server"`, validación con **zod**.
- Código/comentarios en inglés, texto visible en español.
- Imports de componentes UI con mayúscula exacta:
  `@/components/ui/Button`, `@/components/ui/Card`.
- Esta ruta es zona de **cliente autenticado** (no admin). Usa
  `getCurrentCustomer()` de `@/lib/auth/session` (igual que
  `src/app/portal/page.tsx`) para obtener sesión + datos, y
  `createClient()` de `@/lib/supabase/server` — **no**
  `createAdminClient()`, esto no es una ruta de admin. La política RLS
  `"customers self update"` ya permite que el propio cliente actualice su
  fila (`auth.uid() = id`), así que el cliente normal (respetando RLS)
  basta.
- Envuelve el contenido en `<PortalShell>` de `../PortalShell` (mismo
  patrón que el resto de `/portal/**`).
- No hay componentes de formulario reusables (`Input`/`Label`) — usa HTML
  nativo con Tailwind, siguiendo el estilo de
  `src/app/portal/registro/RegisterForm.tsx` (inputs con
  `border-[var(--border)]`, `rounded`, mensajes de error en
  `text-red-700 text-xs` o similar — revisa ese fichero para el tono
  visual exacto de los campos, no inventes uno nuevo).
- **No** toques `src/middleware.ts`, `src/lib/auth/*`,
  `src/app/portal/page.tsx`, `src/app/portal/PortalShell.tsx`,
  `src/app/portal/registro/**`, ni nada de `src/app/admin/**`.

## Tipos y esquema ya existentes

```ts
// src/lib/db/types.ts
export interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
  status: "pending_verification" | "active" | "suspended";
  profile_completed: boolean;
  created_at: string;
}
```

`getCurrentCustomer(): Promise<Customer | null>` (de
`@/lib/auth/session`) — devuelve el cliente actual o `null` si no hay
sesión (defensa en profundidad; el middleware ya protege `/portal/*`
salvo login/registro/recuperar).

Tabla `customers`: RLS de UPDATE (`"customers self update"`) permite al
propio usuario actualizar cualquier columna de su fila, incluida
`profile_completed`.

## Ficheros a crear

### 1. `src/app/portal/completar-perfil/profileActions.ts`

`"use server"`.

```ts
const schema = z.object({
  company_name: z.string().min(2, "La empresa es obligatoria").max(200),
  contact_name: z.string().min(2, "El nombre de contacto es obligatorio").max(200),
  phone: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
});

export type CompleteProfileResult = { ok: true } | { ok: false; error: string };

export async function completeProfile(formData: FormData): Promise<CompleteProfileResult>
```

- Parsear `formData` con `schema.safeParse(...)`. Si falla, devolver el
  primer mensaje de error.
- Obtener el usuario con `createClient()` de `@/lib/supabase/server` →
  `supabase.auth.getUser()`; si no hay usuario, `{ ok: false, error: "Debe iniciar sesión." }`.
- `update({ company_name, contact_name, phone: phone || null, location: location || null, profile_completed: true }).eq("id", user.id)`.
- Si error de Supabase: `{ ok: false, error: "No se pudo guardar el perfil. Intenta de nuevo." }`.
- Si OK: `revalidatePath("/portal")`, `return { ok: true }`.

### 2. `src/app/portal/completar-perfil/CompleteProfileForm.tsx`

Client component (`"use client"`), patrón `useActionState` (igual que
`ProofUpload.tsx` / `ProductForm.tsx` de tandas anteriores).

```tsx
export function CompleteProfileForm({
  customer,
}: {
  customer: { company_name: string; contact_name: string; phone: string | null; location: string | null };
})
```

- Campos precargados con los valores actuales del cliente (aunque sean
  los de fallback tipo "Pendiente" — el usuario los sobrescribe):
  `company_name` (text, required), `contact_name` (text, required),
  `phone` (text, opcional), `location` (text, opcional).
- Al recibir `{ ok: true }` desde el action, redirigir a `/portal` con
  `useRouter().push("/portal")` (patrón ya usado en `ProductForm.tsx`:
  `useEffect` sobre el estado del action).
- Botón submit `<Button variant="primary" disabled={pending}>` texto
  "Guardar y continuar".
- Mensaje de error inline si `state?.ok === false`.

### 3. `src/app/portal/completar-perfil/page.tsx`

Server component, `export const dynamic = "force-dynamic";`.

- `getCurrentCustomer()`; si `null`, `redirect("/portal/login")`.
- Si `customer.profile_completed` ya es `true`, `redirect("/portal")` (no
  tiene sentido mostrar esta pantalla dos veces; evita que alguien la
  visite manualmente después de completar el perfil).
- Si no, renderiza dentro de `<PortalShell>`:
  - Título "Complete su perfil" + un párrafo corto explicando por qué
    (algo como: "Antes de continuar, confirme los datos de su empresa.").
  - `<CompleteProfileForm customer={customer} />`.
- **No** muestres aquí el nav completo del portal con enlaces a
  catálogo/pedidos — el usuario debe completar el perfil antes de
  navegar libremente (aunque `PortalShell` ya trae `Header`/`Footer`
  públicos con sus propios enlaces, eso está fuera de tu control en esta
  tanda; no dupliques enlaces adicionales al catálogo/pedidos en esta
  página).

## Fuera de alcance

- Modificar `src/app/portal/page.tsx` (el guard ya existe).
- Modificar el registro (`src/app/portal/registro/**`) — el bug de origen
  no se corrige aquí, solo se ofrece la vía de recuperación.
- Aplicar el mismo guard a otras subrutas de `/portal` (catálogo, mis
  pedidos, producto) — en esta tanda el guard solo vive en el home del
  portal, que es el punto de entrada natural tras login.
- Tests (Hito 5).

## Criterios de aceptación

1. `npm run build` y `npm run lint` limpios.
2. Un cliente con `profile_completed = false` que visita `/portal` es
   redirigido a `/portal/completar-perfil` (ya verificado, guard
   existente) y ve el formulario precargado con sus datos actuales.
3. Al enviar el formulario con datos válidos, se actualiza `customers` y
   redirige a `/portal`.
4. Si `profile_completed` ya es `true`, visitar
   `/portal/completar-perfil` directamente redirige a `/portal`.
5. Ningún fichero fuera de los 3 listados arriba se crea o modifica.
6. No se toca `src/middleware.ts`, `src/lib/auth/*`,
   `src/app/portal/page.tsx`, `src/app/portal/PortalShell.tsx`,
   `src/app/portal/registro/**`, ni `src/app/admin/**`.
