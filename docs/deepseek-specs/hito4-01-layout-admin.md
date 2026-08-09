# Spec — Hito 4 / Tanda 1: Layout admin

## Objetivo

Crear el shell de navegación del panel admin (`/admin`) para el personal de
Julsa Industrial. Solo la UI de layout — el middleware ya protege `/admin/*`
verificando la tabla `admin_users` (ver `src/middleware.ts`), no hay que
tocarlo ni duplicar esa lógica.

No incluye en esta tanda: CRUD de productos, gestión de pedidos, gestión de
clientes, ni la pantalla "completar perfil". Esas son tandas siguientes que
consumirán este shell.

## Contexto del proyecto (no inventar fuera de esto)

- Next.js 16 App Router + TS estricto + Tailwind 4 (tokens vía `@theme`, no
  hay tokens de espaciado custom: usar escala estándar de Tailwind).
- Autenticación/roles ya resueltos en middleware; esta tanda **no** valida
  sesión de nuevo salvo lo indicado en "Guard adicional" abajo.
- Idioma: código/comentarios en inglés, texto visible en español (regla
  Nortex, `docs/base-standards.md` §2).
- Convención de carpeta: cada ruta es `page.tsx` dentro de su carpeta. Los
  componentes de client interactivo llevan `"use client"` como primera línea.
  Páginas con datos de sesión/DB llevan `export const dynamic = "force-dynamic";`.

## Piezas ya existentes que DEBES reutilizar (no reimplementar)

- `import { Button } from "@/components/ui/Button"` — props:
  `ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }`.
- `import { Card } from "@/components/ui/Card"` — `HTMLAttributes<HTMLDivElement> & { children: ReactNode }`.
- `import { createClient } from "@/lib/supabase/server"` — `async function createClient(): Promise<SupabaseClient>`, para server components.
- `import { createClient } from "@/lib/supabase/browser"` — versión cliente, mismo nombre de función (usar alias al importar junto a la de server, ej. `createClient as createBrowserClient`).
- Patrón de referencia: `src/app/portal/PortalShell.tsx` y `src/app/portal/LogoutButton.tsx` (mismo patrón de "shell + logout", adaptar para admin, no copiar literal porque la nav es distinta).

Design tokens disponibles como `var(--token)` o clase Tailwind (`bg-[var(--token)]`):
`--bg` `#f5f5f5`, `--surface` `#ffffff`, `--text` `#333333`, `--ink` `#1a1a1a`,
`--link` `#008cba`, `--border` `#cccccc`, `--shadow` `#dddddd`,
`--accent` `#e76f00` (naranja, acción primaria), `--accent-deep` `#b5520a` (hover).

## Ficheros a crear

### 1. `src/lib/auth/admin.ts`

Helper análogo a `getCurrentCustomer()` en `src/lib/auth/session.ts`, pero para admin:

```ts
export interface AdminUser {
  user_id: string;
  email: string | null;
}

export async function getCurrentAdmin(): Promise<AdminUser | null>
```

- Usa `createClient()` de `@/lib/supabase/server`.
- Obtiene el usuario con `supabase.auth.getUser()`; si no hay usuario, `return null`.
- Consulta `admin_users` filtrando por `user_id` (`.eq("user_id", user.id).maybeSingle()`); si no hay fila, `return null`.
- Si hay fila, devuelve `{ user_id: user.id, email: user.email ?? null }`.
- No lanza excepción por falta de sesión/rol: siempre devuelve `null` o el objeto. El control de acceso duro ya lo hace el middleware; esto es solo para pintar el email en la UI y por defensa en profundidad si algún día se llama fuera del middleware.

### 2. `src/app/admin/AdminShell.tsx`

Server component (sin `"use client"`), firma:

```tsx
export function AdminShell({
  children,
  adminEmail,
}: {
  children: React.ReactNode;
  adminEmail: string | null;
}): JSX.Element
```

Estructura:
- Header propio de admin (NO reutilizar `Header` público — su nav es fija para la zona pública). Fondo `bg-[var(--ink)]`, contenedor `max-w-[1200px] mx-auto px-6`, `sticky top-0 z-50`, igual que el patrón público pero con estos enlaces (usar `Link` de `next/link`):
  - "Panel" → `/admin`
  - "Productos" → `/admin/productos`
  - "Pedidos" → `/admin/pedidos`
  - "Clientes" → `/admin/clientes`
  - Texto del email admin a la derecha (si `adminEmail` no es null) + `AdminLogoutButton`.
- `<main>` con fondo `bg-[var(--bg)]`, contenedor `max-w-[1200px] mx-auto px-6 py-10`.
- Sin `Footer` (zona operativa, no pública).
- Los enlaces de nav no necesitan estado "activo" resaltado en esta tanda (fuera de alcance).

### 3. `src/app/admin/AdminLogoutButton.tsx`

Client component, calco funcional de `src/app/portal/LogoutButton.tsx`:

```tsx
"use client";
export function AdminLogoutButton(): JSX.Element
```

- `onClick`: `createClient()` de `@/lib/supabase/browser` → `await supabase.auth.signOut()` → `router.push("/portal/login")` → `router.refresh()`.
- Texto visible: "Cerrar sesión".
- Estilo: usar `<Button variant="ghost">`, no un `<button>` suelto.

### 4. `src/app/admin/layout.tsx`

Server component, `export const dynamic = "force-dynamic";`.

```tsx
export default async function AdminLayout({ children }: { children: React.ReactNode })
```

- Llama a `getCurrentAdmin()`. Si devuelve `null`, `redirect("/portal/login")` (defensa en profundidad; en teoría el middleware ya no deja llegar aquí sin rol).
- Envuelve `children` en `<AdminShell adminEmail={admin.email}>`.

### 5. `src/app/admin/page.tsx`

Server component simple, `export const dynamic = "force-dynamic";`.

- Título "Panel de administración" (`<SectionTitle>` de `@/components/ui/Section` si aplica, o un `<h1>` si `Section` no encaja fuera de la zona pública — usar criterio, mantener consistencia tipográfica).
- Cuatro `<Card>` a modo de accesos directos con enlace a `/admin/productos`, `/admin/pedidos`, `/admin/clientes`, y un cuarto "Stock" que también enlaza a `/admin/productos` (el stock se edita como parte del CRUD de producto, no es ruta propia — así lo indica `docs/HANDOFF.md` §4.5).
- Cada card: título corto + una frase descriptiva en español. Sin datos reales todavía (las rutas destino no existen aún, es esperado que den 404 hasta la tanda siguiente — no crear stubs de esas rutas en esta tanda).

## Fuera de alcance (no crear en esta tanda)

- `/admin/productos`, `/admin/pedidos`, `/admin/clientes` (tandas siguientes).
- Cualquier lógica de datos real (conteos, listados).
- Tests (Hito 5).

## Criterios de aceptación

1. `npm run build` compila sin errores ni warnings de tipos.
2. `npm run lint` limpio.
3. Visitar `/admin` sin sesión redirige a `/portal/login` (verificable manualmente o razonando sobre el middleware existente + el guard de `layout.tsx`).
4. Visitar `/admin` con un usuario en `admin_users` muestra el shell: nav con los 4 enlaces, email del admin, botón "Cerrar sesión" funcional, y 4 cards de acceso.
5. Ningún fichero fuera de los 5 listados arriba se crea o modifica.
6. No se toca `src/middleware.ts` ni `src/lib/auth/session.ts`.
7. Todo el código (nombres, comentarios) en inglés; todo el texto visible en español.
