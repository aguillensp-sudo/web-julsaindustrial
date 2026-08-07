# Design — Web Julsa Industrial · Release 1

> Diseño técnico. Derivado de `docs/fase2-define-spec.md` §3 y `docs/fase3-design.md`.
> Artefactos técnicos en inglés; el contenido面向 cliente en español (base-standards §2).

## Architecture overview

Monorepo single-app: **Next.js 14+ (App Router, TypeScript)** con front público,
portal y admin en la misma app, diferenciados por ruta y por rol. Supabase como
capa de datos (Postgres + Auth + Storage) accedida vía `@supabase/ssr` para
sesión en server components y route handlers.

```
app/
  (public)/        → /, /nosotros, /combustibles, /equipamiento-energetico,
                     /autopartes, /materias-primas, /contacto, /legal/*
  (auth)/          → /portal/login, /portal/registro, /portal/recuperar
  (portal)/        → /portal, /portal/catalogo, /portal/producto/[id],
                     /portal/pedido/nuevo, /portal/mis-pedidos
  (admin)/         → /admin/productos, /admin/pedidos, /admin/clientes, /admin/stock
  layout.tsx       → cabecera + pie según zona
lib/
  supabase/        → clients (browser, server, admin), middleware de sesión
  db/              → tipos generados, queries, validación (zod)
components/        → ui (tokens), layout (header/footer), dominio (product-card, …)
styles/            → tokens.css, globals.css
```

## Data model (Postgres via Supabase, con RLS)

Tablas (snake_case, inglés — base-standards §2):

- `customers` — perfil de cliente ligado a `auth.users`. Campos: `id` (uuid, FK a
  `auth.users.id`), `company_name`, `contact_name`, `phone`, `location`, `status`
  (`pending_verification` | `active` | `suspended`), `created_at`.
- `products` — `id`, `line` (enum: `fuels`|`energy`|`autoparts`|`raw_materials`),
  `name`, `description`, `image_path` (Storage), `price_usd` (numeric(10,2)),
  `unit`, `stock` (int), `created_at`, `updated_at`.
- `orders` — `id`, `customer_id`, `status`
  (`in_payment` | `ready_for_delivery`), `total_usd` (numeric(12,2)), `created_at`,
  `updated_at`, `notes`.
- `order_items` — `id`, `order_id`, `product_id`, `quantity`, `unit_price_usd`
  (precio snapshot en fecha de pedido), `line_total_usd`.
- `payment_proofs` — `id`, `order_id`, `file_path` (Storage), `uploaded_at`.
- `admin_users` — marcador de rol admin. Vía `auth.users` + tabla `admin_users`
  o un claim/RSC check. Decisión: tabla `admin_users` con FK a `auth.users.id`,
  chequeada en middleware + RLS.

### Row Level Security (políticas)

- `customers`: un cliente ve/edita solo su fila (`auth.uid() = id`).
- `products`: SELECT público para todos (catálogo público); INSERT/UPDATE/DELETE
  solo rol admin.
- `orders` / `order_items` / `payment_proofs`: SELECT solo del cliente dueño
  (`customer_id` resuelto vía `auth.uid()`) o admin; INSERT del propio cliente;
  UPDATE de `status` solo admin.
- **Precio:** `price_usd` es una columna normal en `products`. La protección del
  precio **no** es a nivel de columna: el frontend público simplemente no la
  muestra. La defensa real está en que la **zona portal** requiere sesión, y la
  API valida sesión antes de devolver datos con precio. (El PO aceptó el riesgo
  de auto-registro; ver fase2-define-spec §5.bis, descartado.)

## Auth & authorization

- Supabase Auth, email/contraseña, con **email confirmation** obligatoria.
- Tras confirmar email, trigger crea fila en `customers` con
  `status = 'active'` (auto-registro puro, sin aprobación manual).
- Middleware de Next.js lee la sesión; route handlers comprueban rol.
- Roles: `customer` (default) y `admin` (fila en `admin_users`).
- Rutas `/admin/*` → 404/redirect si no es admin. Rutas `/portal/*` → redirect a
  login si no autenticado.

## Flows (Release 1)

- **Pedido (cliente):** selecciona producto → cantidad → crea `orders` (status
  `in_payment`) + `order_items` con precio snapshot. Sube `payment_proofs`
  (PDF/JPG/PNG, máx 5MB) a Storage privado. Ve en `mis-pedidos` el semáforo.
- **Pedido (admin):** ve lista, abre comprobante, mueve `in_payment` →
  `ready_for_delivery`. No hay estado `entregado` en R1.
- **Producto (admin):** CRUD completo vía panel; el alta define nombre, línea,
  descripción, imagen, precio USD, unidad, stock.

## File storage

- Bucket `product-images` (público, lectura pública).
- Bucket `payment-proofs` (privado; acceso solo al cliente dueño y admin vía
  signed URL o RLS policies sobre una tabla de metadatos).
- Validación server-side de MIME y tamaño antes de subir.

## Design tokens (de fase3-design.md)

CSS custom properties en `styles/tokens.css`, consumidas por Tailwind preset o
CSS modules. Paleta del brief + `--accent` `#E76F00`. Open Sans (next/font).
Base 14px. Breakpoints 640/1024. Botones naranja con texto ≥16px bold (AA).

## Testing strategy (Perfil B → ≥90% cobertura)

- **Unit:** lógica de dominio (cálculo de totales, validaciones zod, snapshots
  de precio). Vitest + React Testing Library.
- **Integration:** políticas RLS y flujos de pedido con cliente de Supabase de
  prueba. Cobertura ≥90% gate en CI.
- **e2e (crítico):** registro → login → crear pedido → subir comprobante;
  admin → cambiar estado. Playwright.

## Security

- Validación server-side con zod en todos los inputs.
- Secretos vía env vars (Supabase URL/anon/service keys), service key solo
  server-side, nunca en el cliente.
- CSRF/secure cookies por defecto en `@supabase/ssr`.
- Revisión adversarial antes de release (web-validator).

## Release 2 readiness

- `orders.status` ya incluye el flujo; añadir `paid` y la pasarela solo inserta
  un `payments` table + webhook. El modelo no se rompe.
