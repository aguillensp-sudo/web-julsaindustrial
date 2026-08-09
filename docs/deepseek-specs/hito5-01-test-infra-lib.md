# Spec — Hito 5 / Tanda 1: Infraestructura de test + `lib/auth` + `lib/content`

## Objetivo

Arrancar la suite de tests (Vitest ya configurado, umbral de cobertura 90%,
pero **cero tests existen todavía**). Esta tanda cubre:

1. Un mock reutilizable de `createClient()` de `@/lib/supabase/server` que
   los tests de las siguientes tandas también podrán importar.
2. Tests unitarios de `src/lib/auth/session.ts` y `src/lib/auth/admin.ts`.
3. Tests unitarios de `src/lib/content/catalog.ts`.

## Contexto y convenciones (no inventar fuera de esto)

- Framework: **Vitest** (`vitest.config.ts` ya existe, entorno `jsdom`,
  `globals: true` — no hace falta importar `describe`/`it`/`expect`).
- `src/test/setup.ts` ya existe con
  `import "@testing-library/jest-dom/vitest";` — **no la borres**, solo
  añade lo que se pide abajo.
- Código/comentarios en inglés, nombres de test (`describe`/`it`) pueden
  describir el comportamiento en inglés también (son código, no texto de
  cliente).
- Un fichero de test por fichero fuente: `<nombre>.test.ts`, junto al
  fichero que testea (mismo directorio), patrón estándar de este proyecto
  (no crear carpeta `__tests__` separada).
- No instales dependencias nuevas. Ya están disponibles: `vitest`,
  `@testing-library/jest-dom`, `@testing-library/react` (usa `vi.fn()` /
  `vi.mock()` de Vitest para mocks, no `jest`).

## Ficheros fuente a testear (NO modificar estos, son de referencia)

```ts
// src/lib/auth/session.ts
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentCustomer() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}
```

```ts
// src/lib/auth/admin.ts
export interface AdminUser {
  user_id: string;
  email: string | null;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) return null;

  return { user_id: user.id, email: user.email ?? null };
}
```

```ts
// src/lib/content/catalog.ts (extracto relevante para tests)
export interface CatalogItem {
  slug: string;
  line: ProductLine; // "fuels" | "energy" | "autoparts" | "raw_materials"
  name: string;
  description: string;
  specs?: string[];
  visual: "icon" | "photo";
  iconName?: string;
}
export const CATALOG: CatalogItem[]; // 13 items, 4 líneas distintas
export const LINE_META: Record<ProductLine, { title: string; href: string; blurb: string }>;
export function itemsByLine(line: ProductLine): CatalogItem[];
```

Ambos módulos de `auth/*` importan `createClient` desde
`@/lib/supabase/server`, que internamente llama a `cookies()` de
`next/headers` y a `createServerClient` de `@supabase/ssr` — por eso hace
falta mockear el módulo completo `@/lib/supabase/server`, no sus
dependencias internas.

## Ficheros a crear

### 1. `src/test/mocks/supabaseServerClient.ts`

Un helper reutilizable (no es un fichero `.test.ts`, es un helper que los
tests importan) que exporta una función para construir un mock del cliente
de `@/lib/supabase/server` con la forma mínima que usan `session.ts` y
`admin.ts`:

```ts
export function createMockSupabaseServerClient(overrides?: {
  user?: { id: string; email?: string } | null;
  authError?: unknown;
  from?: (table: string) => unknown; // permite mockear .from(...).select(...).eq(...).maybeSingle()
}) { ... }
```

Debe soportar encadenar `.from(table).select(cols).eq(col, val).maybeSingle()`
devolviendo `{ data, error }` configurable por test (usa `vi.fn()` que
devuelven `this`/el siguiente mock encadenado). Exporta también un tipo o
factory para simular distintas tablas (`customers`, `admin_users`) con
distintos resultados en el mismo test si hace falta.

No hace falta que sea genérico para siempre — que cubra exactamente los
dos patrones de uso reales:
- `supabase.auth.getUser()` → `{ data: { user }, error }`
- `supabase.from(table).select("*"|"user_id").eq(col, val).maybeSingle()` → `{ data, error }`

### 2. `src/lib/auth/session.test.ts`

Mockea el módulo `@/lib/supabase/server` con `vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }))`
y usa el helper del punto 1 para configurar el valor de retorno en cada test.

Casos para `getCurrentUser()`:
- Devuelve el `user` cuando `auth.getUser()` resuelve con un usuario.
- Devuelve `null`/`undefined` (lo que realmente devuelva `data.user`) cuando no hay sesión.

Casos para `getCurrentCustomer()`:
- Devuelve `null` sin llamar a `.from("customers")` si no hay usuario
  (verifica con `expect(...).not.toHaveBeenCalled()` sobre el mock de `from`).
- Devuelve la fila de `customers` cuando hay usuario y `maybeSingle()`
  resuelve con datos.
- Devuelve `null` (el `data` tal cual) cuando `maybeSingle()` resuelve sin
  datos.

### 3. `src/lib/auth/admin.test.ts`

Mismo patrón de mock. Casos para `getCurrentAdmin()`:
- Devuelve `null` si no hay usuario autenticado (y no debe llamar a
  `.from("admin_users")`).
- Devuelve `null` si hay usuario pero `admin_users` no tiene fila para
  ese `user_id` (`maybeSingle()` devuelve `data: null`).
- Devuelve `{ user_id, email }` correctamente cuando hay usuario y sí
  existe fila en `admin_users`.
- Devuelve `email: null` (no `undefined`) cuando `user.email` es
  `undefined` — cubre el `?? null` del código fuente.

### 4. `src/lib/content/catalog.test.ts`

Sin mocks, es un módulo de datos puros:
- `CATALOG` no está vacío y cada item tiene `slug`, `line`, `name`,
  `description`, `visual` definidos (no vacíos).
- Todos los `slug` son únicos (`new Set(...).size === CATALOG.length`).
- `itemsByLine("fuels")` devuelve solo items con `line === "fuels"`, y su
  longitud coincide con filtrar `CATALOG` manualmente.
- `itemsByLine` para una línea sin match hipotético no aplica (las 4
  líneas existentes tienen items) — en su lugar, verifica que
  `itemsByLine("energy")` y `itemsByLine("autoparts")` también devuelven
  subconjuntos correctos (cubre las 4 ramas de `ProductLine`).
- `LINE_META` tiene una entrada para cada una de las 4 líneas usadas en
  `CATALOG` (`fuels`, `energy`, `autoparts`, `raw_materials`), cada una
  con `title`, `href`, `blurb` no vacíos.

## Fuera de alcance

- No toques `src/lib/auth/session.ts`, `src/lib/auth/admin.ts`,
  `src/lib/content/catalog.ts`, `src/lib/supabase/server.ts`, ni ningún
  fichero fuera de los 4 listados en "Ficheros a crear".
- No añadas tests de `src/lib/supabase/*` (server/browser/admin.ts) en
  esta tanda — son wrappers finos sobre el SDK, se cubren indirectamente.
- No toques `vitest.config.ts` ni `package.json`.
- No escribas tests de componentes React ni de server actions — eso es
  tandas 2-4.

## Criterios de aceptación

1. `npm run test` pasa en verde (todos los tests de los 3 ficheros
   `.test.ts` en verde).
2. `npm run test:coverage` no tiene por qué llegar al 90% global todavía
   (faltan 3 tandas más) — pero los ficheros testeados
   (`session.ts`, `admin.ts`, `catalog.ts`) deben salir con cobertura
   cercana al 100%.
3. Ningún fichero fuera de los 4 listados en "Ficheros a crear" se crea o
   modifica.
4. Los mocks usan `vi.mock`/`vi.fn` de Vitest, no `jest.mock`.
