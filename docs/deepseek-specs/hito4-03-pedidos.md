# Spec — Hito 4 / Tanda 3: Gestión de pedidos (admin)

## Objetivo

`/admin/pedidos`: listado de todos los pedidos con nombre del cliente,
estado y total. `/admin/pedidos/[id]`: detalle con líneas de producto,
comprobante(s) de pago (bucket privado, vía signed URL) y el único cambio
de estado manual permitido en Release 1: `in_payment` → `ready_for_delivery`.

Consume el shell ya existente (`src/app/admin/layout.tsx`); no hay que
volver a montar `AdminShell`.

## Contexto y convenciones (no inventar fuera de esto)

- Server actions con `"use server"`, `createAdminClient()` de
  `@/lib/supabase/admin` para todas las lecturas/escrituras (bypassa RLS,
  ya protegido por el guard de `/admin`). Mismo patrón que
  `src/app/admin/productos/productActions.ts`.
- Código/comentarios en inglés, texto visible en español.
- No hay componentes `Select`/`Table` reusables — usa HTML nativo con
  Tailwind, como en `ProductForm.tsx`.
- **No** toques `src/middleware.ts`, `src/lib/auth/*`,
  `src/app/admin/AdminShell.tsx`, `src/app/admin/layout.tsx`,
  `src/app/admin/productos/**`, ni nada de `src/app/portal/mis-pedidos/`
  (zona de cliente, fuera de alcance).
- **Regla de negocio importante**: en Release 1 el único cambio de estado
  válido es `in_payment` → `ready_for_delivery`. No es un `<select>`
  genérico de estados — es una única acción de un sentido. No implementes
  la transición inversa ni otros estados.

## Tipos y esquema ya existentes

```ts
// src/lib/db/types.ts
export type OrderStatus = "in_payment" | "ready_for_delivery";

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_usd: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  line_total_usd: number; // generated column, no se escribe nunca
}

export interface PaymentProof {
  id: string;
  order_id: string;
  file_path: string;
  uploaded_at: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  in_payment: "En proceso de pago",
  ready_for_delivery: "Disponible para entrega",
};

export interface Customer {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
  location: string | null;
  status: "pending_verification" | "active" | "suspended";
  created_at: string;
}
```

Relación: `orders.customer_id -> customers.id` (FK directa, no pasa por
`auth.users`). Con supabase-js, el embed usa el nombre de tabla:
`select("id, status, total_usd, created_at, customers(company_name, contact_name)")`.

`order_items.product_id -> products.id`; embed: `products(name, unit)`.

Bucket `payment-proofs` es **privado** (a diferencia de `product-images`).
No existe en el proyecto ninguna función de `createSignedUrl` todavía —
hay que crearla en esta tanda.

## Ficheros a crear

### 1. `src/app/admin/pedidos/orderAdminActions.ts`

`"use server"`.

```ts
export type SignedUrlResult = { ok: true; url: string } | { ok: false; error: string };
export async function getProofSignedUrl(filePath: string): Promise<SignedUrlResult>

export type MarkReadyResult = { ok: true } | { ok: false; error: string };
export async function markReadyForDelivery(orderId: string): Promise<MarkReadyResult>
```

- `getProofSignedUrl`: valida `filePath` no vacío (si viene vacío,
  `{ ok: false, error: "Ruta de fichero inválida." }`). Usa
  `createAdminClient()` → `supabase.storage.from("payment-proofs").createSignedUrl(filePath, 300)`
  (300s = 5 min). Si falla, `{ ok: false, error: "No se pudo generar el enlace del comprobante." }`.
  Si OK, `{ ok: true, url: data.signedUrl }`.
- `markReadyForDelivery`: valida `orderId` con `z.string().uuid()` (usa
  `zod`, ya es dependencia). Antes de actualizar, lee el pedido y comprueba
  que `status === "in_payment"`; si ya está en `ready_for_delivery`,
  devuelve `{ ok: false, error: "El pedido ya está marcado como disponible para entrega." }`
  (evita doble-click / re-envío). Si procede,
  `update({ status: "ready_for_delivery" }).eq("id", orderId)`. Al
  terminar, `revalidatePath("/admin/pedidos")` y
  `revalidatePath(`/admin/pedidos/${orderId}`)`.

### 2. `src/app/admin/pedidos/page.tsx`

Server component, `export const dynamic = "force-dynamic";`.

- Lee todos los pedidos vía `createAdminClient()`:
  `select("id, status, total_usd, created_at, customers(company_name, contact_name)")`,
  ordenados por `created_at` descendente.
- Título "Pedidos".
- Tabla o lista de `<Card>` (a tu criterio, sigue el estilo visual de
  `src/app/admin/productos/page.tsx`) con columnas/campos: cliente
  (`customers.company_name`, con `customers.contact_name` como subtítulo
  pequeño), fecha (`created_at` formateada con
  `new Date(o.created_at).toLocaleDateString("es-ES")`), total
  (`USD ${Number(o.total_usd).toFixed(2)}`), badge de estado usando
  `ORDER_STATUS_LABEL` (verde si `ready_for_delivery`, ámbar si
  `in_payment` — mismos tonos que ya usa `is_active` en productos:
  `bg-green-100 text-green-700` / `bg-amber-100 text-amber-700`), y
  enlace "Ver detalle" → `/admin/pedidos/${o.id}`.
- Estado vacío: `<Card>` con "Todavía no hay pedidos." si la lista está vacía.
- Nota de tipos: el resultado de un embed de Supabase para una relación
  many-to-one puede tipar `customers` como objeto o array de un elemento
  según la versión del cliente — maneja ambos casos con seguridad de tipos
  (por ejemplo `Array.isArray(o.customers) ? o.customers[0] : o.customers`),
  no asumas una forma fija sin comprobar.

### 3. `src/app/admin/pedidos/[id]/page.tsx`

Server component, `export const dynamic = "force-dynamic";`,
`params: Promise<{ id: string }>` (Next 16).

- Busca el pedido con su cliente:
  `select("*, customers(company_name, contact_name, phone, location)").eq("id", id).maybeSingle()`.
  Si no existe: "Pedido no encontrado." + enlace de vuelta a `/admin/pedidos`.
- Busca las líneas: `order_items` con
  `select("id, quantity, unit_price_usd, line_total_usd, products(name, unit)")`
  filtrando `.eq("order_id", id)`.
- Busca los comprobantes: `payment_proofs`
  `select("id, file_path, uploaded_at")` filtrando `.eq("order_id", id)`
  ordenados por `uploaded_at` descendente (puede haber más de uno si el
  cliente subió varias veces).
- Renderiza:
  - Datos del cliente (empresa, contacto, teléfono, ubicación).
  - Estado actual (`ORDER_STATUS_LABEL`), fecha de creación, total, notas
    (`order.notes`, si existe).
  - Tabla/lista de líneas: producto (nombre), cantidad, unidad, precio
    unitario snapshot, total de línea.
  - Lista de comprobantes: por cada uno, fecha de subida +
    `<ProofViewer filePath={proof.file_path} />` (componente cliente, ver
    punto 4). Si no hay ninguno: "Sin comprobante subido todavía."
  - Si `order.status === "in_payment"`: renderiza
    `<MarkReadyButton orderId={order.id} />` (punto 5). Si ya está
    `ready_for_delivery`, no renderices ningún botón de acción — solo el
    badge de estado.
  - Enlace "← Volver a pedidos" a `/admin/pedidos`.

### 4. `src/app/admin/pedidos/[id]/ProofViewer.tsx`

Client component (`"use client"`).

```tsx
export function ProofViewer({ filePath }: { filePath: string })
```

- Botón `<Button variant="ghost">` texto "Ver comprobante". `onClick`
  async: llama a `getProofSignedUrl(filePath)`; si `ok`, abre la URL en
  pestaña nueva (`window.open(result.url, "_blank", "noopener,noreferrer")`);
  si falla, muestra el error inline (`text-red-700 text-xs`) bajo el botón.
  Deshabilita el botón mientras está pendiente, igual que
  `ToggleActiveButton.tsx` en productos.

### 5. `src/app/admin/pedidos/[id]/MarkReadyButton.tsx`

Client component (`"use client"`).

```tsx
export function MarkReadyButton({ orderId }: { orderId: string })
```

- Botón `<Button variant="primary">` texto "Marcar como disponible para
  entrega". `onClick` async llama a `markReadyForDelivery(orderId)`; si
  `ok`, `router.refresh()`; si falla, muestra el error inline. Deshabilita
  mientras está pendiente. Mismo patrón que `ToggleActiveButton.tsx`.

## Fuera de alcance

- Clientes (tanda siguiente).
- Filtros/búsqueda en el listado de pedidos.
- Notificar al cliente (email) cuando cambia el estado.
- Cualquier cambio a `src/app/portal/mis-pedidos/` (zona de cliente).
- Tests (Hito 5).

## Criterios de aceptación

1. `npm run build` y `npm run lint` limpios.
2. `/admin/pedidos` lista todos los pedidos con cliente, fecha, total y
   badge de estado, ordenados del más reciente al más antiguo.
3. `/admin/pedidos/[id]` muestra cliente, líneas de producto, notas si las
   hay, y comprobante(s) con botón que abre una URL firmada temporal.
4. Un pedido en `in_payment` muestra el botón de cambio de estado; al
   pulsarlo pasa a `ready_for_delivery` sin recarga manual
   (`router.refresh()`), y el botón desaparece.
5. Un pedido ya en `ready_for_delivery` no muestra ningún botón de acción.
6. Ningún fichero fuera de los 5 listados arriba se crea o modifica.
7. No se toca `src/middleware.ts`, `src/lib/auth/*`,
   `src/app/admin/AdminShell.tsx`, `src/app/admin/layout.tsx`,
   `src/app/admin/productos/**`, ni `src/app/portal/mis-pedidos/**`.
